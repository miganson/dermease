import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { TextField, type TextFieldProps } from "@mui/material";

type FormTextFieldProps<T extends FieldValues> = TextFieldProps & {
  control: Control<T>;
  name: Path<T>;
};

export function FormTextField<T extends FieldValues>({
  control,
  name,
  children,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          value={field.value ?? ""}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? props.helperText}
        >
          {children}
        </TextField>
      )}
    />
  );
}
