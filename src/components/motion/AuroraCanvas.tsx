import React, { useEffect, useRef } from 'react';

// Live WebGL backdrop: flowing aurora ribbons across the whole site, plus a black-glass 3D orb
// with an iridescent rim on the home hero that turns toward the cursor. Plain WebGL (no library),
// rendered at reduced resolution, paused while the tab is hidden, a single still frame for
// visitors who prefer reduced motion, and nothing at all if WebGL is unavailable.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_scroll;
uniform float u_light;
uniform float u_orb;
uniform vec3 u_orbGeo; // x, y (pixels, GL coords), radius (pixels)

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

// Violet -> magenta -> amber -> cyan -> violet
vec3 spectrum(float t) {
  vec3 c0 = vec3(0.45, 0.30, 1.00);
  vec3 c1 = vec3(1.00, 0.25, 0.66);
  vec3 c2 = vec3(1.00, 0.70, 0.30);
  vec3 c3 = vec3(0.15, 0.82, 1.00);
  t = fract(t) * 4.0;
  float k = smoothstep(0.0, 1.0, fract(t));
  if (t < 1.0) return mix(c0, c1, k);
  if (t < 2.0) return mix(c1, c2, k);
  if (t < 3.0) return mix(c2, c3, k);
  return mix(c3, c0, k);
}

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

float orbSdf(vec3 p, float t) {
  float wobble = sin(3.1 * p.x + t * 1.3) * sin(2.7 * p.y + t * 1.1) * sin(3.3 * p.z + t * 0.9);
  return length(p) - 0.82 - 0.07 * wobble;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * u_res) / u_res.y;
  float t = u_time * 0.05;

  // --- Aurora ribbons (light mode only; dark mode stays pure black, so the noise is skipped) ---
  vec3 col = vec3(0.0);
  float a = 0.0;
  if (u_light > 0.5) {
    vec2 ap = p + (u_mouse - 0.5) * vec2(0.10, -0.06);
    ap.y += u_scroll * 0.00022;
    vec2 q = vec2(fbm(ap * 1.2 + t), fbm(ap * 1.2 - t + 5.2));
    vec2 r = vec2(fbm(ap * 1.5 + 2.0 * q + vec2(1.7, 9.2) + t * 0.7),
                  fbm(ap * 1.5 + 2.0 * q + vec2(8.3, 2.8) - t * 0.6));
    float f = fbm(ap * 1.3 + 2.4 * r);

    col = spectrum(f * 1.1 + r.x * 0.7 + t * 0.6);
    // Squared by multiplication: pow() with a negative base is undefined and returns NaN on
    // Windows GPUs, which painted the whole canvas white
    float band = (ap.y - (sin(ap.x * 1.7 + t * 4.0) * 0.16 + (r.y - 0.5) * 0.9 + 0.12)) * 3.0;
    float ribbon = exp(-band * band);
    a = smoothstep(0.3, 0.9, f) * 0.6 + ribbon * f * 0.7;
    // Keep the middle of the screen calmer so text stays easy to read
    a = clamp(a * mix(0.6, 1.0, smoothstep(0.15, 0.75, length(p * vec2(0.8, 1.2)))), 0.0, 0.2);
    col *= 0.6;
  }

  // --- Hero orb ---
  if (u_orb > 0.002) {
    vec2 d = (frag - u_orbGeo.xy) / u_orbGeo.z;
    float dist = length(d);
    // Coloured halo around the orb
    float halo = exp(-max(dist - 0.8, 0.0) * 7.0) * 0.35 * u_orb;
    vec3 haloCol = spectrum(atan(d.y, d.x) / 6.2831 + t * 2.0);
    col = mix(col, haloCol, clamp(halo / max(a + halo, 0.001), 0.0, 1.0));
    a = max(a, halo);

    if (dist < 1.05) {
      mat3 rot = rotY((u_mouse.x - 0.5) * 1.4 + u_time * 0.12) * rotX((u_mouse.y - 0.5) * 1.0);
      vec3 ro = vec3(d, -2.0);
      vec3 rd = vec3(0.0, 0.0, 1.0);
      float dt = 0.0;
      float minH = 10.0;
      bool hit = false;
      for (int i = 0; i < 40; i++) {
        float h = orbSdf(rot * (ro + rd * dt), u_time);
        minH = min(minH, h);
        if (h < 0.002) { hit = true; break; }
        dt += h * 0.8;
        if (dt > 3.2) break;
      }
      if (hit) {
        vec3 pos = rot * (ro + rd * dt);
        vec2 e = vec2(0.003, 0.0);
        vec3 n = normalize(vec3(
          orbSdf(pos + e.xyy, u_time) - orbSdf(pos - e.xyy, u_time),
          orbSdf(pos + e.yxy, u_time) - orbSdf(pos - e.yxy, u_time),
          orbSdf(pos + e.yyx, u_time) - orbSdf(pos - e.yyx, u_time)));
        vec3 v = rot * -rd;
        float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
        vec3 film = spectrum(dot(n, vec3(0.35, 0.55, 0.75)) * 0.9 + fres * 0.8 + t * 3.0);
        vec3 body = mix(vec3(0.03, 0.015, 0.08), film, clamp(fres * 1.1 - 0.05, 0.0, 1.0));
        vec3 l = rot * normalize(vec3(-0.5, 0.65, -0.6));
        float spec = pow(max(dot(reflect(-v, n), l), 0.0), 48.0);
        vec3 orbCol = body + spec * 0.9 + film * 0.08;
        // Soften the silhouette: the outermost sliver fades into the rim colour
        float edge = smoothstep(0.0, 0.035, -orbSdf(pos - n * 0.035, u_time) + 0.035);
        col = mix(col, orbCol, u_orb * edge);
        a = mix(a, 1.0, u_orb * edge);
      } else if (minH < 0.03) {
        // Anti-aliased rim for rays that just graze the orb
        float cov = 1.0 - smoothstep(0.0, 0.03, minH);
        vec3 rim = spectrum(atan(d.y, d.x) / 6.2831 + t * 3.0);
        col = mix(col, rim, u_orb * cov);
        a = mix(a, 1.0, u_orb * cov * 0.8);
      }
    }
  }

  if (u_light > 0.5) {
    col = mix(col, vec3(1.0), 0.25);
    a *= 0.5;
  }
  // Never emit NaN or over-bright values (either shows up as white on some GPUs)
  if (!(a >= 0.0)) a = 0.0;
  if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
  a = clamp(a, 0.0, 1.0);
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
}
`;

interface Props {
  showOrb: boolean;
  light: boolean;
}

export const AuroraCanvas: React.FC<Props> = ({ showOrb, light }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ showOrb, light });
  propsRef.current = { showOrb, light };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u('u_res'), uTime = u('u_time'), uMouse = u('u_mouse'), uScroll = u('u_scroll');
    const uLight = u('u_light'), uOrb = u('u_orb'), uOrbGeo = u('u_orbGeo');

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Render below device resolution: the image is soft by nature, so this costs nothing visible
    let scale = 1;
    // Set on devices that can't keep up (see watchSpeed): fewer, smaller frames
    let lite = false;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      scale = Math.min(window.devicePixelRatio || 1, 2) * (w < 768 ? 0.45 : 0.6) * (lite ? 0.7 : 1);
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    let orb = 0;
    let raf = 0;
    let frame = 0;
    let drawn = 0;
    let broken = false;
    let cleared = false;
    const start = performance.now();
    // Safety net: the screen corners are always (nearly) empty in this scene. If a GPU/driver
    // paints them solid anyway, the canvas is hidden for good so the page keeps its own background.
    const pixel = new Uint8Array(4);
    // Each read waits for the GPU, so it only runs on a few early frames
    const CHECK_FRAMES = new Set([1, 4, 12, 30]);
    const opaqueAt = (x: number, y: number) => {
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      return pixel[3] > 128;
    };
    const cornerLooksWrong = () =>
      opaqueAt(0, 0) || opaqueAt(0, canvas.height - 1) || opaqueAt(canvas.width - 1, 0);
    // Slow-device check: after the page has settled, if most frames arrive late the scene switches
    // to 30fps at lower resolution (and the page drops its other paint-heavy flourish via .perf-lite).
    // Fast devices never trip it, so they see exactly the same thing.
    let lastT = 0;
    let sampled = 0;
    let slow = 0;
    const watchSpeed = (now: number) => {
      if (!lite && sampled < 90 && now - start > 3000 && !document.hidden && lastT) {
        sampled++;
        if (now - lastT > 24) slow++;
        if (sampled === 90 && slow > 45) {
          lite = true;
          document.documentElement.classList.add('perf-lite');
          resize();
        }
      }
      lastT = now;
    };
    const draw = () => {
      watchSpeed(performance.now());
      frame++;
      const light = propsRef.current.light;
      // The light-mode aurora drifts slowly: 30fps looks the same and halves the GPU work
      if ((lite || (light && !propsRef.current.showOrb && orb < 0.01)) && frame % 2 === 0) {
        if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
        return;
      }
      const w = window.innerWidth, h = window.innerHeight;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      orb += ((propsRef.current.showOrb ? 1 : 0) - orb) * 0.05;
      const scrollY = window.scrollY;

      // Orb sits between the headline and the intro video on wide screens, top-right on phones,
      // and drifts up faster than the page as you scroll (parallax)
      const wide = w >= 1024;
      const radius = (wide ? Math.min(w, h) * 0.3 : Math.min(w, h) * 0.42) * scale;
      const ox = (wide ? w * 0.56 : w * 0.82) * scale;
      const oy = (h - (wide ? h * 0.5 : h * 0.24) + scrollY * 1.35) * scale;

      // Dark mode draws only the orb: once it has scrolled out of view there is nothing to render
      const orbVisible = orb > 0.002 && oy - radius * 1.6 < canvas.height && oy + radius * 1.6 > 0;
      if (!light && !orbVisible) {
        if (!cleared) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          cleared = true;
        }
        if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
        return;
      }
      cleared = false;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, reduced ? 12 : (performance.now() - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scrollY * scale);
      gl.uniform1f(uLight, light ? 1 : 0);
      gl.uniform1f(uOrb, reduced ? (propsRef.current.showOrb ? 1 : 0) : orb);
      gl.uniform3f(uOrbGeo, ox, oy, radius);
      if (light) {
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else {
        // Dark mode: only the orb and its glow are drawn, so the GPU shades just that box
        const reach = radius * 1.6;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(Math.floor(ox - reach), Math.floor(oy - reach), Math.ceil(reach * 2), Math.ceil(reach * 2));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disable(gl.SCISSOR_TEST);
      }

      // Check a few early frames (while the orb fades in); only show the canvas once a frame looks right
      if (CHECK_FRAMES.has(++drawn)) {
        if (cornerLooksWrong()) {
          broken = true;
          canvas.style.display = 'none';
          return;
        }
        canvas.style.opacity = '1';
      }

      if (!reduced && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !broken) raf = requestAnimationFrame(draw);
    };
    // Reduced motion: redraw only when something changes
    const onStill = () => {
      if (!broken) requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVisibility);
    if (reduced) {
      window.addEventListener('scroll', onStill, { passive: true });
      window.addEventListener('resize', onStill);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onStill);
      window.removeEventListener('resize', onStill);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  // Theme or page changes need one fresh frame when motion is reduced
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) window.dispatchEvent(new Event('resize'));
  }, [showOrb, light]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-[1500ms]"
    />
  );
};
