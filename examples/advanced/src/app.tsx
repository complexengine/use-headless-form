import { useState } from "react";
import type { inferFormValidation } from "use-headless-form";
import { createFormDescriptor, useHeadlessForm } from "use-headless-form";
import { FormErrors } from "./form-errors";

const formDescription = createFormDescriptor<
  {
    username: string;
    password: string;
    passwordAgain: string;
    startingDate: string;
  },
  {
    username: string;
    password: string;
    passwordAgain: string;
    startingDate: Date;
  }
>({
  username: {
    defaultValue: "",
    validators: [
      (value) =>
        (value.length < 2 || value.length > 50) &&
        "Username must be between 2-50 characters.",
    ],
    transformer: (value) => value.trim(),
  },
  startingDate: {
    defaultValue: new Date().toISOString().slice(0, 10),
    transformer: (value) => new Date(value),
  },
  password: {
    defaultValue: "",
    validators: [
      (value) =>
        value.length === 0 && (
          <span className="bg-red-500">Password cannot be empty.</span>
        ),
      (value) =>
        value.length < 8 && "Password needs to be atleast 8 characters long.",
      (value) =>
        value.length > 250 && "Password cannot be more than 250 characters.",
    ],
  },
  passwordAgain: {
    defaultValue: "",
    validators: [
      (value) => value.length === 0 && "Password cannot be empty",
      (value, { password }) =>
        value !== password.value && "Passwords do not match",
    ],
  },
});

type DemoFormValidation = inferFormValidation<typeof formDescription>;

const FormStep1 = ({
  validation,
  onNextStep,
}: {
  validation: DemoFormValidation;
  onNextStep: () => void;
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">📝 Form</h1>
      <h5 className="font-bold">Username</h5>
      <div className="border border-neutral-900 rounded-md overflow-hidden mb-4">
        <input
          className="py-2 px-3 bg-black outline-none text-white hover:bg-neutral-900 w-full"
          type="text"
          placeholder="username"
          value={validation.fields.username.sourceValue}
          onInput={(e) => validation.fields.username.set(e.currentTarget.value)}
        />
        <FormErrors errors={validation.fields.username.errors} />
      </div>
      <h5 className="font-bold">Password</h5>
      <div className="border border-neutral-900 rounded-md overflow-hidden mb-4">
        <input
          className="p-2 bg-black outline-none text-white hover:bg-neutral-900 w-full"
          type="password"
          placeholder="password"
          value={validation.fields.password.sourceValue}
          onInput={(e) => validation.fields.password.set(e.currentTarget.value)}
        />
        <FormErrors errors={validation.fields.password.errors} />
      </div>
      <h5 className="font-bold">Confirm password</h5>
      <div className="border border-neutral-900 rounded-md overflow-hidden mb-4">
        <input
          className="p-2 bg-black outline-none text-white hover:bg-neutral-900 w-full"
          type="password"
          placeholder="confirm password"
          value={validation.fields.passwordAgain.sourceValue}
          onInput={(e) =>
            validation.fields.passwordAgain.set(e.currentTarget.value)
          }
        />
        <FormErrors errors={validation.fields.passwordAgain.errors} />
      </div>
      <div className="text-right">
        <button
          className="bg-blue-700 px-3 py-2 rounded-md transition-all disabled:bg-neutral-500"
          disabled={
            !validation.satisfies("username", "password", "passwordAgain")
          }
          onClick={onNextStep}
        >
          Next
        </button>
      </div>
    </>
  );
};

function FormStep2({
  validation,
  onPrevStep,
}: {
  validation: DemoFormValidation;
  onPrevStep: () => void;
}) {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">📝 Form</h1>
      <h5 className="font-bold">Choose starting date</h5>
      <div className="border border-neutral-900 rounded-md overflow-hidden mb-4">
        <input
          className="p-2 bg-black outline-none text-white hover:bg-neutral-900 w-full"
          value={validation.fields.startingDate.sourceValue}
          onInput={(e) =>
            validation.fields.startingDate.set(e.currentTarget.value)
          }
          type="date"
        />
      </div>
      <div className="text-right">
        <button
          className="mr-2 hover:underline px-3 py-2 rounded-md transition-all disabled:bg-neutral-500"
          onClick={(e) => {
            e.preventDefault();
            onPrevStep();
          }}
        >
          Prev
        </button>
        <button
          className="bg-blue-700 px-3 py-2 rounded-md transition-all disabled:bg-neutral-500"
          disabled={!validation.satisfied}
        >
          Submit
        </button>
      </div>
    </>
  );
}

const App = () => {
  const validation = useHeadlessForm(formDescription);
  const [step, setStep] = useState<1 | 2 | "done">(1);

  return (
    <form
      className="max-w-md m-auto mt-32 border border-neutral-900 p-4 rounded-md"
      onSubmit={(e) => {
        setStep("done");
        e.preventDefault();
      }}
    >
      {step === 1 ? (
        <FormStep1
          validation={validation}
          onNextStep={() => {
            setStep(2);
          }}
        />
      ) : step === 2 ? (
        <FormStep2 validation={validation} onPrevStep={() => setStep(1)} />
      ) : step === "done" ? (
        <>
          <p>Username: {validation.fields.username.value}</p>
          <p>
            Password (hover): [
            <span className="text-black hover:text-white">
              {validation.fields.password.value}
            </span>
            ]
          </p>
          <p>
            Starting date: {validation.fields.startingDate.value.toISOString()}
          </p>
          <div className="text-center">
            <button
              className="bg-blue-700 px-3 py-2 rounded-md transition-all disabled:bg-neutral-500"
              onClick={() => {
                validation.resetFields();
                setStep(1);
              }}
            >
              Start again
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
};

export default App;
