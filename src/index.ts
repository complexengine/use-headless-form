import type React from "react";
import { useState } from "react";

export type FormField<V, TV> = {
  /**
   * Function to set the form field value
   * @param value - The new value to set the form field to
   */
  set: (value: V) => void;
  /**
   * Errors generated from validators
   */
  errors: React.ReactNode[];
  /**
   * Indicates whether the form field has any errors
   */
  satisfied: boolean;
  /**
   * The original value of the form field from the `set` method
   */
  sourceValue: V;
  /**
   * The final value of the form field which has been transformed if the form field has a `transformer`
   */
  value: TV;
};

export type FormValidation<
  A extends { [F in keyof A]: A[F] },
  B extends { [F in keyof A]: B[F] }
> = {
  fields: {
    [F in keyof A]: FormField<A[F], B[F]>;
  };
  /**
   * Indicates whether all of the form fields are satisfied
   */
  satisfied: boolean;
  /**
   * Returns true if the provided form fields are satisfied
   */
  satisfies: (...fieldNames: [keyof A, ...(keyof A)[]]) => boolean;
  /**
   * Resets all form fields to their default value
   */
  resetFields: () => void;
};

export type FormFieldDescriptor<V, TV, U = Record<string, unknown>> = {
  /**
   * The default value of the form field
   */
  defaultValue: V;
  /**
   * An array of functions that performs validation on the form field and returns an error as a `ReactNode`
   */
  validators?: ((
    value: TV,
    transformedAndSourceValues: U
  ) => React.ReactNode | unknown)[];
  /**
   * Transforms the value of the form field
   */
  transformer?: (value: V) => TV;
};

export type FormDescriptor<
  A extends { [F in keyof A]: A[F] },
  B extends { [F in keyof A]: F extends keyof B ? B[F] : A[F] }
> = {
  [F in keyof A]: FormFieldDescriptor<
    A[F],
    B[F],
    {
      [F in keyof A]: {
        sourceValue: A[F];
        value: B[F];
      };
    }
  >;
};

/**
 * Helper function to infer `FormDescriptor`
 */
export function createFormDescriptor<
  A,
  B extends {
    [F in keyof A]: F extends keyof B ? B[F] : A[F];
  }
>(descriptor: FormDescriptor<A, B>) {
  return descriptor;
}

/**
 * Infer `FormValidation` from `FormDescriptor`
 */
export type inferFormValidation<T> = T extends FormDescriptor<infer A, infer B>
  ? FormValidation<A, B>
  : never;

/**
 * Hook that provides form validation functionality
 * @param fields - An object that defines the fields of the form and their validation properties
 */
export function useHeadlessForm<
  A extends { [F in keyof A]: A[F] },
  B extends { [F in keyof A]: F extends keyof B ? B[F] : A[F] }
>(fields: FormDescriptor<A, B>): FormValidation<A, B> {
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
    satisfies: (...fieldNames: [keyof A, ...(keyof A)[]]) => {
      let satisfied = true;
      for (const fieldName of fieldNames) {
        satisfied &&= formFields[fieldName].satisfied;
      }
      return satisfied;
    },
    resetFields: () => setState(initialState),
  };
}
