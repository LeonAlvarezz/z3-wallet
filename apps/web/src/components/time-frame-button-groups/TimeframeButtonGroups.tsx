import { useState } from "react";
import { ButtonGroup } from "../ui/button-group";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { BaseModel } from "@z3-wallet/types";
const items: { label: string; value: BaseModel.TimeFrameEnum }[] = [
  { label: "TD", value: BaseModel.TimeFrameEnum.TODAY },
  { label: "W", value: BaseModel.TimeFrameEnum.WEEK },
  { label: "M", value: BaseModel.TimeFrameEnum.MONTH },
  { label: "Y", value: BaseModel.TimeFrameEnum.YEAR },
  { label: "AL", value: BaseModel.TimeFrameEnum.ALL_TIME },
];

export default function TimeframeButtonGroup({
  defaultValue = BaseModel.TimeFrameEnum.MONTH,
  value,
  onChange,
}: {
  defaultValue?: BaseModel.TimeFrameEnum;
  value?: BaseModel.TimeFrameEnum;
  onChange?: (value: BaseModel.TimeFrameEnum) => void;
}) {
  const [selected, setSelected] = useState<BaseModel.TimeFrameEnum>(
    defaultValue ?? value,
  );
  // const selected = value ?? internalSelected;

  const handleSelect = (v: BaseModel.TimeFrameEnum) => {
    setSelected(v);
    onChange?.(v);
  };

  return (
    <ButtonGroup role="radiogroup">
      {items.map((item) => (
        <Button
          key={item.value}
          role="radio"
          aria-checked={selected === item.value}
          size="xs"
          variant="outline"
          className={cn(
            "px-4 opacity-50",
            selected === item.value && "border! opacity-100",
          )}
          onClick={() => handleSelect(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
