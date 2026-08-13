/**
 * A control the field can hand over, reduced to the two things a group needs: where it
 * sits in the row, and how to hand it over. This lets a group treat a `tls-input` and a
 * bare `<input class="tls-form-control">` alike — the first knows what handing it over
 * means, the second can only be focused.
 */
export interface ActivatableControl {
  element: HTMLElement;
  activate: () => void;
}
