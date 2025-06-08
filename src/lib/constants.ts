export const COMPONENT_TYPES = {
  TEXT: "text",
  BUTTON: "button",
  CONTAINER: "container",
  STACK: "stack",
  CARD: "card",
  TEXT_FIELD: "textField",
  CHECKBOX: "checkbox",
  SWITCH: "switch",
  RADIO: "radio",
  ICON: "icon",
  LIST_VIEW: "listView",
  SLIDER: "slider",
  DROPDOWN_BUTTON: "dropdownButton",
  TABLE: "table",
}

export const ACTION_TYPES = {
  UPDATE_COMPONENT: 'UPDATE_COMPONENT',
  UPDATE_COMPONENT_PROPERTY: 'UPDATE_COMPONENT_PROPERTY',
  DELETE_COMPONENT: 'DELETE_COMPONENT',
  ADD_COMPONENT: 'ADD_COMPONENT',
  MOVE_COMPONENT: 'MOVE_COMPONENT',
  ADD_PAGE: 'ADD_PAGE',
  DELETE_PAGE: 'DELETE_PAGE',
} as const;
