import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ValidationError } from '../types';

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
      <span className="validation-error-row__icon">
        <img
          src="/icons/error-exclamation.svg"
          width={12}
          height={12}
          alt="エラー"
        />
      </span>
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
            <img
              src="/icons/open.svg"
              width={12}
              height={12}
              alt="別タブで開く"
            />
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
    margin-top: 2px;
    content: '!';
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: ${warningColor};
    color: #fff;
    border-radius: 50%;
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
  }
  &.validation-error-row--critical {
    .validation-error-row__message {
      /* color: var(--c-error); */
    }
    .validation-error-row__icon {
      background: var(--c-error);
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
            {warnings.length}件の修正をおすすめします
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
