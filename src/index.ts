import type React from "react";
import { useState } from "react";

export type FormField<V, TV> = {
  set: (value: V) => void;
  errors: React.ReactNode[];
  satisfied: boolean;
  sourceValue: V;
  value: TV;
};

type FormValidation<
  A extends { [F in keyof A]: A[F] },
  B extends { [F in keyof A]: B[F] }
> = {
  fields: {
    [F in keyof A]: FormField<A[F], B[F]>;
  };
  satisfied: boolean;
  resetFields: () => void;
};

export type FormFieldValidation<V, TV, U = Record<string, unknown>> = {
  defaultValue: V;
  validators?: ((
    value: V,
    transformedAndSourceValues: U
  ) => React.ReactNode | unknown)[];
  transformer?: (value: V) => TV;
};

export function useHeadlessForm<
  A extends B,
  B extends { [F in keyof A]: F extends keyof B ? B[F] : A[F] }
>(fields: {
  [F in keyof A]: FormFieldValidation<
    A[F],
    B[F],
    {
      [F in keyof A]: {
        sourceValue: A[F];
        value: B[F];
      };
    }
  >;
}): FormValidation<A, B> {
  const initialState: { [F in keyof A]: A[F] } = Object.entries(fields).reduce(
    (acc, [fieldName, props]) => {
      const { defaultValue } = props as typeof fields[keyof A];
      acc[fieldName as keyof A] = defaultValue;
      return acc;
    },
    {} as { [F in keyof A]: A[F] }
  );

  const [state, setState] = useState<{ [F in keyof A]: A[F] }>(initialState);
  let allSatisfied = true;

  const transformedAndSourceValues = Object.entries(fields).reduce(
    (acc, [fieldName, props]) => {
      const { transformer } = props as typeof fields[keyof A];
      const sourceValue = state[fieldName as keyof A];
      acc[fieldName as keyof A] = {
        value: transformer ? transformer(sourceValue) : sourceValue,
        sourceValue,
      };
      return acc;
    },
    {} as { [F in keyof A]: { sourceValue: A[F]; value: B[F] } }
  );

  const formFields = Object.entries(fields).reduce(
    (acc, [fieldName, props]) => {
      const { validators } = props as typeof fields[keyof A];
      const { sourceValue, value } =
        transformedAndSourceValues[fieldName as keyof A];
      const errors = validators
        ? (validators
            .map((fn) => fn(value, transformedAndSourceValues))
            .filter((maybeError) => !!maybeError) as React.ReactNode[])
        : [];

      const satisfied = errors.length === 0;
      acc[fieldName as keyof A] = {
        set: (value: A[keyof A]) => {
          setState({ ...state, [fieldName]: value });
        },
        errors,
        sourceValue,
        value,
        satisfied,
      };

      allSatisfied &&= satisfied;
      return acc;
    },
    {} as {
      [F in keyof A]: FormField<A[F], B[F]>;
    }
  );

  return {
    fields: formFields,
    satisfied: allSatisfied,
    resetFields: () => setState(initialState),
  };
}
