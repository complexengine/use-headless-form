# use-headless-form

A typesafe headless react hook for forms.

## Installation

    npm install use-headless-form

## Demo
For a more advanced demo, click [here](https://codesandbox.io/s/github/complexengine/use-headless-form/tree/main/examples/advanced?file=/src/app.tsx) or,

<a href="https://codesandbox.io/s/github/complexengine/use-headless-form/tree/main/examples/advanced?file=/src/app.tsx">
  <img width="200" src="https://user-images.githubusercontent.com/51714798/211045303-2603f241-412b-4c4e-8a34-476ae7ba189b.png" />
</a>

## Usage

```tsx
const Form = () => {
  const validation = useHeadlessForm({
    username: {
      defaultValue: "",
      validators: [
        (value) =>
          (value.length < 2 || value.length > 50) &&
          "Username must be between 2-50 characters.",
      ],
      transformer: (value) => value.trim(),
    },
    password: {
      defaultValue: "",
      validators: [
        (value) => value.length === 0 && <span className="bg-red-500">Password cannot be empty.</span>,
        (value) =>
          value.length < 8 && "Password needs to be atleast 8 characters long.",
        (value) =>
          value.length > 250 && "Password cannot be more than 250 characters.",
      ],
    },
    passwordAgain: {
      defaultValue: "",
      validators: [
        (value, { password }) =>
          value !== password.value && "Passwords do not match",
      ],
    },
  });

  return (
    <form
      onSubmit={() => {
        const formData = {
          username: validation.fields.username.value,
          password: validation.fields.password.value,
        };
        console.log(formData); // or submit form
      }}
    >
      {!validation.fields.username.satisfied && (
        <FormErrors errors={validation.fields.username.errors} />
      )}
      <input
        type="text"
        placeholder="username"
        value={validation.fields.username.sourceValue}
        onInput={(e) => validation.fields.username.set(e.currentTarget.value)}
      />
      {!validation.fields.password.satisfied && (
        <FormErrors errors={validation.fields.password.errors} />
      )}
      <input
        type="password"
        placeholder="password"
        value={validation.fields.password.sourceValue}
        onInput={(e) => validation.fields.password.set(e.currentTarget.value)}
      />
      {!validation.fields.passwordAgain.satisfied && (
        <FormErrors errors={validation.fields.passwordAgain.errors} />
      )}
      <input
        type="password"
        placeholder="password"
        value={validation.fields.passwordAgain.sourceValue}
        onInput={(e) =>
          validation.fields.passwordAgain.set(e.currentTarget.value)
        }
      />
      <button
        className="bg-white disabled:bg-neutral-500"
        disabled={!validation.satisfied}
      >
        Submit
      </button>
    </form>
  );
};

const FormErrors = ({ errors }: { errors: React.ReactNode[] }) => (
  <div>
    {errors.map((error, idx) => (
      <div key={idx}>{error}</div>
    ))}
  </div>
);
```