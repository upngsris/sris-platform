/**
 * The six SRIS disciplines. `value` is what Sanity stores on a learning item
 * and what the `?discipline=` query string carries, so it must match the list
 * in studio/schemaTypes/disciplines.ts.
 */
export const disciplines = [
  { value: "physics", title: "Physics" },
  { value: "chemistry", title: "Chemistry" },
  { value: "biology", title: "Biology" },
  { value: "environmental-science", title: "Environmental Science" },
  {
    value: "mathematics-computer-science",
    title: "Mathematics & Computer Science",
  },
  { value: "earth-sciences", title: "Earth Sciences" },
] as const;

export type Discipline = (typeof disciplines)[number]["value"];

export function findDiscipline(value: string | string[] | undefined) {
  const requested = Array.isArray(value) ? value[0] : value;

  return disciplines.find((discipline) => discipline.value === requested);
}

export function disciplineTitle(value: string) {
  return findDiscipline(value)?.title ?? value;
}
