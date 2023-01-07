# use-headless-form

A headless react hook for forms.

## Demo

```ts
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
        (value) => value.length === 0 && "Password cannot be empty.",
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
        className="bg-white disabled:bg-green-50"
        disabled={!validation.satisfied}
      >
        Submit
      </button>
    </form>
  );
};

const FormErrors = ({ errors }: { errors: string[] }) => (
  <div className="bg-white">
    {errors.map((error, idx) => (
      <span key={idx}>{error}</span>
    ))}
  </div>
);

export default Form;

```
