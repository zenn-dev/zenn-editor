import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ValidationError } from '../types';

import { MdError, MdOutlineCallMade } from 'react-icons/md';

const warningColor = '#ff9715';

const ValidationErrorRow: React.VFC<ValidationError> = ({
  message,
  isCritical,
  detailUrl,
  detailUrlText,
}) => {
  return (
    <StyledValidationErrorRow
      className={`validation-error-row ${
        isCritical ? 'validation-error-row--critical' : ''
      }`}
    >
      <MdError className="validation-error-row__icon" />
      <div className="validation-error-row__message">
        {message}
        {typeof detailUrl === 'string' && (
          <a
            className="validation-error-row__link"
            href={detailUrl}
            target="_blank"
            rel="nofollow noreferrer"
          >
            {detailUrlText || '詳細を見る'}
            <MdOutlineCallMade className="validation-error-row__link-icon" />
          </a>
        )}
      </div>
    </StyledValidationErrorRow>
  );
};

const StyledValidationErrorRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 0.5rem;
  .validation-error-row__icon {
    width: 26px;
    height: 26px;
    color: ${warningColor};
    flex-shrink: 0;
    transform: translateY(-0.1em);
  }
  .validation-error-row__message {
    flex: 1;
    color: var(--c-gray);
    font-size: 14px;
    margin-left: 7px;
  }
  .validation-error-row__link {
    margin-left: 6px;
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: var(--c-gray-border);
    display: inline-flex;
    align-items: center;
    &:hover {
      color: var(--c-body);
    }
  }
  .validation-error-row__link-icon {
    width: 15px;
    height: 15px;
  }
  &.validation-error-row--critical {
    .validation-error-row__message {
      /* color: var(--c-error); */
    }
    .validation-error-row__icon {
      color: var(--c-error);
    }
  }
`;

export const ValidationErrors: React.VFC<{
  validationErrors: ValidationError[];
}> = ({ validationErrors }) => {
  const { criticalErrors, warnings } = useMemo(
    () =>
      validationErrors.reduce(
        (acc, val) => {
          acc[val.isCritical ? 'criticalErrors' : 'warnings'].push(val);
          return acc;
        },
        {
          criticalErrors: [],
          warnings: [],
        } as {
          criticalErrors: ValidationError[];
          warnings: ValidationError[];
        }
      ),
    [validationErrors]
  );

  if (!validationErrors.length) return null;

  return (
    <StyledValidationErrors className="validation-error">
      {criticalErrors.length > 0 && (
        <div className="validation-error__critical">
          <div className="validation-error__title validation-error__title--critical">
            {criticalErrors.length}件のエラーがあります
          </div>
          {criticalErrors.map((validationError, i) => (
            <ValidationErrorRow
              key={`validation-error-${i}`}
              {...validationError}
            />
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="validation-error__warnings">
          <div className="validation-error__title">
            {warnings.length}件の注意事項があります
          </div>
          {warnings.map((validationError, i) => (
            <ValidationErrorRow
              key={`validation-error-${i}`}
              {...validationError}
            />
          ))}
        </div>
      )}
    </StyledValidationErrors>
  );
};

const StyledValidationErrors = styled.div`
  padding: 1.2rem 1.4rem 1.3rem;
  background: #fff;
  border-radius: 10px;
  .validation-error__title {
    font-size: 0.95rem;
    color: ${warningColor};
    font-weight: 700;
  }
  .validation-error__title--critical {
    color: var(--c-error);
  }
  .validation-error__critical + .validation-error__warnings {
    margin-top: 1.2rem;
  }
`;
