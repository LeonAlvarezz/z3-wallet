import { BaseModel } from "@z3-wallet/types";

export const getMonth = () => {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const nextMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return { now, monthStart, nextMonthStart };
};

export function getTimeFrameRange(timeFrame?: BaseModel.TimeFrameEnum) {
  if (!timeFrame || timeFrame === BaseModel.TimeFrameEnum.ALL_TIME) {
    return {
      start: undefined,
      endExclusive: undefined,
    };
  }

  const now = new Date();
  const startOfDayUtc = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  let start: Date | undefined;
  let endExclusive: Date | undefined;

  switch (timeFrame) {
    case BaseModel.TimeFrameEnum.TODAY:
      start = startOfDayUtc(now);
      endExclusive = new Date(start);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      break;

    case BaseModel.TimeFrameEnum.YESTERDAY:
      endExclusive = startOfDayUtc(now);
      start = new Date(endExclusive);
      start.setUTCDate(start.getUTCDate() - 1);
      break;

    case BaseModel.TimeFrameEnum.WEEK:
      const day = now.getUTCDay();
      const diffFromMonday = (day + 6) % 7;
      start = startOfDayUtc(now);
      start.setUTCDate(start.getUTCDate() - diffFromMonday);
      endExclusive = startOfDayUtc(now); // ← add this
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1); // end of today
      break;

    case BaseModel.TimeFrameEnum.MONTH:
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      endExclusive = startOfDayUtc(now); // ← add this
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      break;

    case BaseModel.TimeFrameEnum.YEAR:
      start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      endExclusive = startOfDayUtc(now); // ← add this
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
      break;
    default:
      break;
  }

  return {
    start,
    endExclusive,
  };
}
