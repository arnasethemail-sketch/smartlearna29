import { lessons001To034 } from "./lessons-001-034";
import { lessons035To067 } from "./lessons-035-067";
import { lessons068To100 } from "./lessons-068-100";

export const storyLessons = [
  ...lessons001To034,
  ...lessons035To067,
  ...lessons068To100,
].sort((left, right) => left.sequence - right.sequence);
