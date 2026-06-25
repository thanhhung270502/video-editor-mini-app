"use client";

import type { ComponentRef, Ref } from "react";
import React, { createContext, useContext } from "react";
import { RemoveScroll } from "react-remove-scroll";
import type {
  ActionMeta,
  ClassNamesConfig,
  ClearIndicatorProps,
  DropdownIndicatorProps,
  GroupBase,
  IndicatorSeparatorProps,
  MultiValue,
  OptionsOrGroups,
  Props as ReactSelectProps,
  SingleValue,
} from "react-select";
import ReactSelect, { components as ReactSelectComponents } from "react-select";
import { ChevronDownIcon, InfoIcon, XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";

export type SelectValue = string | number;
export interface SelectOption {
  label: string;
  value: SelectValue;
  isDisabled?: boolean;
}

const SELECT_MIN_WIDTH = "min-w-[200px]";

// Type definitions for custom components
type MenuProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = React.ComponentProps<typeof ReactSelectComponents.Menu<Option, IsMulti, Group>>;
type MenuListProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = React.ComponentProps<typeof ReactSelectComponents.MenuList<Option, IsMulti, Group>>;

// Context to pass scrollableContainerRef to custom components
export const ScrollableContainerContext = createContext<
  React.RefObject<HTMLDivElement | null> | undefined
>(undefined);

// Custom react-select components
export const DropdownIndicator = (
  props: DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) => {
  return (
    <ReactSelectComponents.DropdownIndicator {...props}>
      <ChevronDownIcon size={16} className="text-tertiary transition-transform duration-150" />
    </ReactSelectComponents.DropdownIndicator>
  );
};

export const IndicatorSeparator = (
  _: IndicatorSeparatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) => {
  return null;
};

export const ClearIndicator = (
  props: ClearIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) => {
  return (
    <ReactSelectComponents.ClearIndicator {...props}>
      <XIcon size={16} className="text-secondary cursor-pointer" />
    </ReactSelectComponents.ClearIndicator>
  );
};

export const MenuSelect = (props: MenuProps<SelectOption, boolean, GroupBase<SelectOption>>) => {
  return <ReactSelectComponents.Menu {...props}>{props.children}</ReactSelectComponents.Menu>;
};

export const MenuListSelect = (
  props: MenuListProps<SelectOption, boolean, GroupBase<SelectOption>>
) => {
  const menuListRef = React.useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useContext(ScrollableContainerContext);

  // Combine menuListRef with scrollableContainerRef for shards
  const shards = scrollableContainerRef ? [menuListRef, scrollableContainerRef] : [menuListRef];

  return (
    <RemoveScroll shards={shards}>
      <ReactSelectComponents.MenuList {...props} innerRef={menuListRef}>
        {props.children}
      </ReactSelectComponents.MenuList>
    </RemoveScroll>
  );
};

export const controlVariants = cva(
  [
    "relative flex items-center w-full rounded-md border border-solid",
    "transition-colors cursor-pointer",
  ],
  {
    variants: {
      variant: {
        default: "border-brand-primary! bg-brand-primary-dark",
        destructive: "border-error bg-brand-primary-dark",
        ghost: "border-transparent bg-transparent w-12", // Used only in react-select as the leading component for the input
        text: "border-transparent bg-transparent", // Text variant: no border, no shadow
      },
      size: {
        sm: "min-h-9 px-xl py-md",
        md: "min-h-12 px-xl py-xl",
      },
      disabled: {
        true: "bg-disabled-subtle border-disabled-subtle cursor-not-allowed hover:border-disabled-subtle",
        false: "",
      },
      focused: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        focused: true,
        class: "border-brand-primary!",
      },
      {
        variant: "destructive",
        focused: true,
        class: "border-error-primary!",
      },
      {
        variant: "ghost",
        focused: true,
        class: "",
      },
      {
        variant: "text",
        focused: true,
        class: "",
      },
      {
        variant: "default",
        focused: false,
        disabled: false,
        class: "hover:border-secondary",
      },
      {
        variant: "destructive",
        focused: false,
        disabled: false,
        class: "hover:border-error",
      },
      {
        variant: "ghost",
        focused: false,
        disabled: false,
        class: "",
      },
      {
        variant: "text",
        focused: false,
        disabled: false,
        class: "",
      },
      {
        variant: "ghost",
        size: "sm",
        class: "!min-h-6 !px-0 !py-0",
      },
      {
        variant: "ghost",
        size: "md",
        class: "!px-0 !py-0",
      },
      {
        variant: "text",
        size: "sm",
        class: "px-md py-sm",
      },
      {
        variant: "text",
        size: "md",
        class: "px-lg py-md",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      disabled: false,
      focused: false,
    },
  }
);

export const valueContainerVariants = cva(
  ["flex flex-wrap items-center flex-1 overflow-hidden px-0"],
  {
    variants: {
      size: {
        sm: "gap-sm",
        md: "gap-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const inputVariants = cva(
  ["bg-transparent border-0 outline-none", "text-primary placeholder:text-placeholder"],
  {
    variants: {
      disabled: {
        true: "text-disabled cursor-not-allowed",
        false: "",
      },
      size: {
        sm: "body-sm",
        md: "body-md",
      },
    },
    defaultVariants: {
      disabled: false,
      size: "md",
    },
  }
);

export const placeholderVariants = cva(["text-primary"], {
  variants: {
    disabled: {
      true: "text-disabled",
      false: "",
    },
    size: {
      sm: ["body-sm"],
      md: ["body-md"],
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export const singleValueVariants = cva(["text-primary"], {
  variants: {
    disabled: {
      true: "text-disabled",
      false: "",
    },
    size: {
      sm: ["body-sm"],
      md: ["body-md"],
    },
    variant: {
      default: "",
      destructive: "",
      ghost: "text-center",
      text: "",
    },
  },
  defaultVariants: {
    disabled: false,
    variant: "default",
  },
});

export const multiValueVariants = cva(
  ["flex items-center gap-xs bg-primary border border-secondary rounded-xxs px-md py-xxs"],
  {
    variants: {
      size: {
        sm: "body-sm",
        md: "body-md",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const multiValueLabelVariants = cva(["text-secondary font-medium"], {
  variants: {
    size: {
      sm: "body-sm",
      md: "body-md",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const multiValueRemoveVariants = cva([
  "text-secondary font-medium hover:text-primary rounded cursor-pointer",
]);

export const indicatorsContainerVariants = cva(["flex items-center shrink-0"], {
  variants: {
    size: {
      sm: "gap-xxs",
      md: "gap-md",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const dropdownIndicatorVariants = cva(
  ["flex items-center justify-center transition-transform duration-150", "text-tertiary"],
  {
    variants: {
      disabled: {
        true: "text-disabled",
        false: "",
      },
      menuOpen: {
        true: "rotate-180",
        false: "",
      },
    },
    defaultVariants: {
      disabled: false,
      menuOpen: false,
    },
  }
);

export const clearIndicatorVariants = cva(
  ["flex items-center justify-center text-tertiary hover:text-secondary"],
  {
    variants: {
      disabled: {
        true: "text-disabled",
        false: "",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

export const menuVariants = cva([
  "absolute w-full bg-brand-primary-dark rounded-md border border-brand-primary",
  "shadow-lg overflow-hidden mt-sm",
  "scrollbar-thin",
  "pointer-events-auto",
]);

export const menuListVariants = cva(
  ["max-h-48 overflow-y-auto py-sm pointer-events-auto touch-action-auto"],
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        ghost: "scrollbar-hide",
        text: "",
      },
    },
  }
);

export const optionVariants = cva(
  ["flex items-center cursor-pointer transition-colors", "font-medium"],
  {
    variants: {
      size: {
        sm: "px-lg py-sm body-sm",
        md: "px-lg py-md body-md",
      },
      state: {
        default: "bg-transparent text-primary",
        focused: "bg-brand-primary text-secondary",
        selected: "bg-brand-primary text-secondary",
        disabled: "bg-transparent text-disabled cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
);

export const messageVariants = cva(["text-tertiary px-lg"], {
  variants: {
    size: {
      sm: "py-md body-sm",
      md: "py-lg body-md",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const selectWrapperVariants = cva(["w-full"], {
  variants: {
    variant: {
      default: "",
      destructive: "",
      ghost: "",
      text: "",
    },
    disabled: {
      true: "",
      false: "",
    },
    fullWidth: {
      true: "w-full",
      false: "w-auto",
    },
  },
  defaultVariants: {
    variant: "default",
    disabled: false,
    fullWidth: false,
  },
});

const labelVariants = cva(["font-medium text-secondary"], {
  variants: {
    size: {
      sm: "body-xs",
      md: "body-sm",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const helperTextVariants = cva(["font-medium"], {
  variants: {
    variant: {
      default: "text-tertiary",
      error: "text-error-primary",
    },
    size: {
      sm: "body-sm",
      md: "body-md",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface SelectProps
  extends
    Omit<ReactSelectProps<SelectOption, boolean>, "onChange" | "value" | "defaultValue">,
    VariantProps<typeof selectWrapperVariants> {
  /**
   * The variant of the select
   * @default "default"
   */
  variant?: "default" | "destructive" | "ghost" | "text";

  /**
   * The size of the select
   * @default "md"
   */
  size?: "sm" | "md";

  /**
   * Label text for the select
   */
  label?: string;

  /**
   * ID for the select element. If not provided, will be auto-generated.
   */
  id?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether to show help icon next to label
   * @default false
   */
  showHelp?: boolean;

  /**
   * Helper text below the select
   */
  helperText?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Selected value(s)
   */
  value?: SelectOption | SelectOption[] | null;

  /**
   * Default value(s)
   */
  defaultValue?: SelectOption | SelectOption[] | null;

  /**
   * Callback when value changes
   */
  onChange?: (
    newValue: SingleValue<SelectOption> | MultiValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>
  ) => void;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the select should take full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Custom className for the wrapper
   */
  className?: string;

  /**
   * Whether to capture menu scroll events
   * @default true
   */
  captureMenuScroll?: boolean;

  /**
   * Whether the menu should scroll into view when opened
   * @default true
   */
  menuShouldScrollIntoView?: boolean;

  /**
   * Portal target for the menu
   * @default document.body
   */
  menuPortalTarget?: HTMLElement | null;

  /**
   * Menu positioning strategy
   * @default "absolute"
   */
  menuPosition?: "absolute" | "fixed";

  /**
   * Ref for the select element (React 19 style)
   */
  ref?: Ref<ComponentRef<typeof ReactSelect<SelectOption, boolean, GroupBase<SelectOption>>>>;

  /**
   * Ref to a scrollable container that should remain scrollable when the menu is open
   * Useful when the select is inside a modal/sheet that needs to scroll
   */
  scrollableContainerRef?: React.RefObject<HTMLDivElement | null>;

  /**
   * Class name for the wrapper
   */
  wrapperClassName?: string;

  /**
   * Class name for the label wrapper
   */
  labelWrapperClassName?: string;

  /**
   * Class name for the control
   */
  controlClassName?: string;
}

const Select = ({
  className,
  size = "md",
  variant = "default",
  label,
  id,
  required = false,
  showHelp = false,
  helperText,
  error,
  disabled = false,
  fullWidth = false,
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder = "Select...",
  isMulti = false,
  isClearable = false,
  isSearchable = true,
  captureMenuScroll = true,
  menuShouldScrollIntoView = true,
  menuPortalTarget = typeof document !== "undefined" ? document.body : null,
  menuPosition = "fixed",
  scrollableContainerRef,
  ref,
  wrapperClassName,
  labelWrapperClassName,
  controlClassName,
  ...props
}: SelectProps) => {
  const autoId = React.useId();
  const selectId = id || autoId;

  const hasError = !!error;
  const effectiveVariant = hasError ? "destructive" : variant;

  const getCustomClassNames = (): ClassNamesConfig<SelectOption, boolean> => {
    return {
      control: (state) =>
        cn(
          controlVariants({
            variant: effectiveVariant,
            size,
            disabled,
            focused: state?.isFocused || false,
          }),
          controlClassName
        ),
      valueContainer: () => valueContainerVariants({ size }),
      input: () => inputVariants({ disabled, size }),
      placeholder: () => placeholderVariants({ disabled, size }),
      singleValue: () => singleValueVariants({ disabled, variant, size }),
      multiValue: () => multiValueVariants({ size }),
      multiValueLabel: () => multiValueLabelVariants({ size }),
      menuPortal: () => "!z-dropdown scrollbar-thin pointer-events-auto",
      multiValueRemove: () => multiValueRemoveVariants(),
      indicatorsContainer: () => indicatorsContainerVariants({ size }),
      dropdownIndicator: (state: any) =>
        dropdownIndicatorVariants({
          disabled,
          menuOpen: state?.selectProps?.menuIsOpen || false,
        }),
      clearIndicator: () => clearIndicatorVariants({ disabled }),
      menu: () => menuVariants(),
      menuList: () => menuListVariants({ variant }),
      option: (state) => {
        let optionState: "default" | "focused" | "selected" | "disabled" = "default";

        if (state?.isDisabled) {
          optionState = "disabled";
        } else if (state?.isSelected) {
          optionState = "selected";
        } else if (state?.isFocused) {
          optionState = "focused";
        }

        return optionVariants({ size, state: optionState });
      },
      noOptionsMessage: () => messageVariants({ size }),
      loadingMessage: () => messageVariants({ size }),
    };
  };

  return (
    <div className={cn("gap-sm flex flex-col", fullWidth ? "w-full" : "w-auto", wrapperClassName)}>
      {label && (
        <div className={cn("gap-xxs flex flex-row items-center", labelWrapperClassName)}>
          <label htmlFor={selectId} className={labelVariants({ size })}>
            {label}
          </label>
          {required && <span className={cn(labelVariants({ size }), "text-brand-primary")}>*</span>}
          {showHelp && (
            <div className="ml-xs text-quaternary">
              <InfoIcon size={16} className="text-quaternary" />
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          selectWrapperVariants({ variant: effectiveVariant, disabled, fullWidth }),
          SELECT_MIN_WIDTH,
          className
        )}
      >
        <ScrollableContainerContext.Provider value={scrollableContainerRef}>
          <ReactSelect
            ref={ref}
            instanceId={selectId}
            inputId={selectId}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            isMulti={isMulti}
            isClearable={isClearable}
            isSearchable={isSearchable}
            isDisabled={disabled}
            captureMenuScroll={captureMenuScroll}
            menuShouldScrollIntoView={menuShouldScrollIntoView}
            menuPortalTarget={menuPortalTarget}
            menuPosition={menuPosition}
            {...props}
            classNamePrefix="react-select"
            unstyled
            classNames={getCustomClassNames()}
            components={{
              DropdownIndicator,
              IndicatorSeparator,
              ClearIndicator,
              Menu: MenuSelect,
              MenuList: MenuListSelect,
            }}
          />
        </ScrollableContainerContext.Provider>
      </div>

      {(helperText || error) && (
        <div className={cn(helperTextVariants({ variant: hasError ? "error" : "default", size }))}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

Select.displayName = "Select";

// Helpers
export const isGroupOption = (
  option: SelectOption | GroupBase<SelectOption>
): option is GroupBase<SelectOption> => {
  return "options" in option;
};

export const getOptionValue = (
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>,
  value: SelectValue
): SelectOption | GroupBase<SelectOption> | undefined => {
  return options.find((option) => {
    if (isGroupOption(option)) {
      return option.options.find((option) => option.value === value);
    }
    return option.value === value;
  });
};

export const getOptionsValue = (
  options: OptionsOrGroups<SelectOption, GroupBase<SelectOption>>,
  value: SelectValue | SelectValue[]
): SelectOption | SelectOption[] | undefined => {
  return Array.isArray(value)
    ? value.map((item: SelectValue) => getOptionValue(options || [], item) as SelectOption)
    : (getOptionValue(options || [], value) as SelectOption);
};

export const onSelectChange =
  (onChange: (value: SelectValue | SelectValue[]) => void) =>
  (value: SingleValue<SelectOption> | MultiValue<SelectOption>) => {
    if (Array.isArray(value)) {
      onChange(value.map((item) => item?.value as SelectValue));
    } else {
      onChange((value as SingleValue<SelectOption>)?.value as SelectValue);
    }
  };

export { MultiValue, Select, SingleValue };
