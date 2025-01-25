import type {
  Control,
  FieldPath,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@renderer/components/ui//form";
import { Label } from "@renderer/components/ui//label";
import { RadioGroup } from "@renderer/components/ui//radio-group";

type RadioInputProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  register: UseFormRegister<TFieldValues>;
  options: { value: string; label: string }[];
  className?: string;
  formDescription?: string;
};

function RadioInput<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  register,
  options,
  className,
  formDescription,
}: RadioInputProps<TFieldValues>): JSX.Element {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={className}
            >
              {options.map((option) => (
                <FormItem className="flex items-center" key={option.value}>
                  <input
                    type="radio"
                    className="peer absolute opacity-0"
                    id={`${name}-${option.value}`}
                    value={option.value}
                    {...register(name)}
                  />

                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className={`flex w-full cursor-pointer items-center justify-start gap-2.5 rounded-sm border border-input bg-white p-4 text-slate-600 shadow-sm hover:border-foreground peer-checked:border-foreground peer-checked:bg-slate-100 peer-checked:text-foreground peer-checked:shadow-none peer-focus:border-foreground peer-checked:[&>:first-child>*]:bg-foreground peer-checked:[&>:first-child]:border-foreground`}
                  >
                    <div className="rounded-full border border-slate-500 bg-inherit p-0.5">
                      <div className="rounded-full bg-none p-1" />
                    </div>
                    <div className="font-normal leading-5">{option.label}</div>
                  </Label>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {formDescription && (
            <FormDescription className="mt-1">
              {formDescription}
            </FormDescription>
          )}
        </div>
      )}
    />
  );
}

export default RadioInput;
//         <FormItem className="space-y-3">
{
  /* <FormControl>
<RadioGroup
  onValueChange={field.onChange}
  defaultValue={field.value}
  className="flex space-x-4"
>
  {options.map((option) => (
    <FormItem
      className="flex items-center space-x-2"
      key={option.value}
    >
      <FormControl>
        <RadioGroupItem value={option.value} />
      </FormControl>
      <FormLabel className="font-normal">{option.label}</FormLabel>
    </FormItem>
  ))}
</RadioGroup>
</FormControl>
</FormItem> */
}
