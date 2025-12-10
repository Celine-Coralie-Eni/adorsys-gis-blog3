---

title: Chakra UI
slug: chakra-ui
tags: [react, ui, accessibility, theme]
lang: en

---

![Chakra UI](https://chakra-ui.com/og-image.png)

---

## Introduction to Chakra UI

Chakra UI is a **React component library** that provides accessible, themeable, and composable components to build modern UIs quickly.

---

## Why Chakra UI?

1. **Accessibility-first**
2. **Easy Theming** with tokens and style props
3. **Composable Components**
4. **Dark/Light Mode Support**
5. **Developer Productivity**

---

## Installation

```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

Wrap your app with the ChakraProvider:

```jsx
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <MyApp />
    </ChakraProvider>
  );
}
```

---

## Core Concepts

* **Style Props**: Inline styling via props (`<Box p={4} bg="teal.100" />`)
* **Responsive Styles**: Arrays or objects for breakpoints
* **Theme Tokens**: Colors, spacing, typography centralized in theme
* **Color Mode**: Dark/Light toggle out of the box

---

## Example Button

```jsx
import { Button } from "@chakra-ui/react";

<Button colorScheme="teal" size="lg">
  Click Me
</Button>
```

---

## Layout Components

* `Box` – Generic container
* `Flex` – Flexbox layout
* `Stack` – Vertical or horizontal spacing
* `Grid` – CSS grid layout

---

## Accessibility

* All components come with **ARIA attributes** pre-configured
* Keyboard navigation support included
* Color contrast adherence

---

## Theming

Extend the default theme:

```jsx
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      500: "#1a365d",
    },
  },
});
```

---

## Popular Components

* **Form Controls**: Input, Select, Switch
* **Feedback**: Alert, Spinner, Toast
* **Navigation**: Menu, Tabs, Drawer
* **Overlay**: Modal, Tooltip, Popover

---

## Conclusion

Chakra UI helps developers build **accessible, consistent, and beautiful React apps** faster with minimal effort. It’s the go-to UI library for rapid prototyping and production-ready design systems.

---