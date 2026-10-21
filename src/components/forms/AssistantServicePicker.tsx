import React from 'react';
import { ASSISTANTS, type AssistantId } from '../../data/assistantsData';
import type { LeadDivision } from '../../types';

// What the visitor needs: an Assistant (then optionally one of its services), the Full Team, or not sure yet
export interface AssistantChoice {
  assistant: AssistantId | 'full-team' | '';
  service: string; // sub-service id, '' = not sure which
}

export const EMPTY_CHOICE: AssistantChoice = { assistant: '', service: '' };

// How a choice is sent with the lead, so the dashboard files it under Assistant > service
export function routingFor(choice: AssistantChoice): { divisionKey: LeadDivision; serviceId?: string; title: string; divisionLabel: string } {
  if (choice.assistant === 'full-team') {
    return { divisionKey: 'full-team', title: 'Full Team (all three Assistants)', divisionLabel: 'Full Team' };
  }
  const assistant = ASSISTANTS.find((a) => a.id === choice.assistant);
  if (!assistant) return { divisionKey: 'general', title: 'Not sure yet', divisionLabel: 'General' };
  const service = assistant.subServices.find((s) => s.id === choice.service);
  return {
    divisionKey: assistant.id,
    serviceId: service?.id,
    title: service ? `${assistant.name}: ${service.title}` : assistant.name,
    divisionLabel: assistant.name
  };
}

interface Props {
  value: AssistantChoice;
  onChange: (value: AssistantChoice) => void;
  idPrefix: string;
  fieldClass: string;
  labelClass: string;
}

// Two-step choice: first the Assistant; picking one Assistant opens a second box with its services
export const AssistantServicePicker: React.FC<Props> = ({ value, onChange, idPrefix, fieldClass, labelClass }) => {
  const assistant = ASSISTANTS.find((a) => a.id === value.assistant);
  return (
    <>
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-assistant`} className={labelClass}>
          Which Assistant do you need?
        </label>
        <select
          id={`${idPrefix}-assistant`}
          value={value.assistant}
          onChange={(e) => onChange({ assistant: e.target.value as AssistantChoice['assistant'], service: '' })}
          className={fieldClass}
        >
          <option value="" className="bg-surface text-fg">Not sure yet</option>
          {ASSISTANTS.map((a) => (
            <option key={a.id} value={a.id} className="bg-surface text-fg">
              {a.name}
            </option>
          ))}
          <option value="full-team" className="bg-surface text-fg">Full Team (all three)</option>
        </select>
      </div>

      {assistant && (
        <div className="space-y-2 animate-pop-in">
          <label htmlFor={`${idPrefix}-service`} className={labelClass}>
            Which service?
          </label>
          <select
            id={`${idPrefix}-service`}
            value={value.service}
            onChange={(e) => onChange({ ...value, service: e.target.value })}
            className={fieldClass}
          >
            <option value="" className="bg-surface text-fg">Not sure / a few of these</option>
            {assistant.subServices.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface text-fg">
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};
