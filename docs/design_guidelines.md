# OmniKit Design Guidelines

This document outlines the standard design patterns and UI specifications for the OmniKit application. All new tools and features should adhere to these guidelines to ensure consistency and a premium user experience.

## 1. Tool Layout Structure

### Split-Pane Layout (Standard)
For most tools that involve an "Input -> Output" workflow, use the **Split-Pane Layout**.

*   **Container Width**: `max-w-[1600px]` to allow sufficient space for side-by-side panels.
*   **Desktop (lg+)**: 
    *   **Left Panel (Configuration)**: Contains all input fields, sliders, switches, and action buttons.
    *   **Right Panel (Preview/Result)**: Displays the generated output (text, image, code, etc.).
    *   **Ratio**: Typically 50/50 or 40/60 depending on content density.
*   **Mobile (<lg)**:
    *   Automatically stacks vertically.
    *   Configuration panel on top, Result panel on bottom.

### Component Structure
```tsx
<div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
  {/* Left Panel: Configuration */}
  <Card className="flex-1 overflow-y-auto">
    <CardHeader>
      <CardTitle>Configuration</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Inputs go here */}
    </CardContent>
  </Card>

  {/* Right Panel: Result */}
  <Card className="flex-1 bg-muted/30 flex flex-col p-6 border-dashed">
    {/* Output goes here */}
  </Card>
</div>
```

## 2. Interactive Elements

### Copy Button
Use the standard `CopyButton` component for all copy-to-clipboard actions.

*   **Behavior**: 
    *   On click, copies the provided `value` to the clipboard.
    *   Shows a toast notification ("Copied to clipboard").
    *   **Visual Feedback**: The copy icon transitions to a green checkmark for 2 seconds.
*   **Usage**:
    ```tsx
    import { CopyButton } from '@/components/ui/copy-button';
    
    <CopyButton value={textToCopy} />
    ```

### Cards
*   Use `Card` components from `shadcn/ui` to group related content.
*   **Result Panels**: Use `bg-muted/30` and `border-dashed` to visually distinguish the output area from the input area.

## 3. Theming

*   **Modes**: Support Light, Dark, and System modes.
*   **Contrast**: Ensure text and interactive elements remain visible in both modes.
*   **Backgrounds**: Use `bg-background` for main content and `bg-muted` for secondary/background areas to create depth.

## 4. Internationalization (i18n)

*   **All Text**: Every visible string must be translatable.
*   **Keys**: Store translations in `src/messages/{locale}.json`.
*   **Structure**: Group tool-specific translations under `Tools.{ComponentName}`.
    ```json
    "Tools": {
      "MyNewTool": {
        "title": "My Tool Name",
        "description": "What this tool does",
        "label1": "Label Text"
      }
    }
    ```
*   **Hook**: Use `useTranslations('Tools.MyNewTool')` in components.

## 5. Responsive Design

*   **Mobile First**: Design for mobile screens first, then enhance for desktop.
*   **Touch Targets**: Ensure buttons and inputs are large enough for touch interaction (min 44px height recommended).
*   **Scroll**: Use `overflow-y-auto` for panels that might exceed the viewport height, preventing the entire page from scrolling unnecessarily.

## 6. Search Input Design

For search functionality, use enhanced styling to ensure visibility across all themes.

### Search Box Standards
*   **Background**: Always use `bg-background` to ensure a clear background (white in light mode, dark in dark mode).
*   **Border**: Use `border-2` for double-width borders that stand out from the page background.
*   **Interactive States**:
    *   **Default**: `border-input` (standard border color)
    *   **Hover**: `hover:border-primary/50` (50% opacity primary color)
    *   **Focus**: `focus-visible:border-primary` (solid primary color)
*   **Focus Ring**: `focus-visible:ring-2 focus-visible:ring-primary/20` for a prominent focus indicator.
*   **Shadow**: `shadow-sm` for subtle depth and separation from background.
*   **Transition**: `transition-colors` for smooth color changes during interactions.
*   **Icon Placement**: 
    *   Use `absolute` positioning with `left-3 top-1/2 transform -translate-y-1/2`
    *   Add `z-10` to ensure icon stays above the input background
    *   Use `text-muted-foreground` for icon color
*   **Padding**: Use `pl-10` (left padding) when including a left-side icon.

### Implementation Example
```tsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
  <Input
    placeholder={t('searchPlaceholder')}
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    }}
    className="pl-10 bg-background border-2 border-input hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm transition-colors"
  />
</div>
```

### Search Button (Optional)
*   When providing a dedicated search button alongside the input:
    *   Use primary variant: `<Button onClick={handleSearch}>`
    *   Include both icon and text for clarity
    *   Example: `<Search className="h-4 w-4 mr-2" /> {t('search')}`

### Why These Standards?
*   **Visibility**: The enhanced borders and backgrounds ensure search boxes don't blend into page backgrounds (especially important in light mode with gray backgrounds).
*   **Feedback**: Clear visual feedback on hover and focus helps users understand the active input state.
*   **Accessibility**: Strong focus indicators meet WCAG guidelines and help keyboard navigation.
*   **Consistency**: Using the same pattern across all search inputs creates a predictable user experience.

## 7. Tool Configuration States

For tools that require external configuration (e.g., API Keys, Tokens) to function, follow these guidelines for the unconfigured state.

### Configuration Warning Banner
*   **Placement**: Display a warning banner at the top of the tool page, above the main Split-Pane layout.
*   **Style**: Use a `destructive` style to draw attention but keep it within the design system.
*   **Content**:
    *   **Icon**: `AlertCircle` (text-destructive)
    *   **Message**: Clear statement that configuration is missing.
    *   **Action**: A button linking directly to the relevant settings page.
*   **Behavior**:
    *   **Disable Inputs**: The main tool inputs and action buttons must be `disabled`.
    *   **Do Not Hide**: Do not completely hide the tool UI; let the user see what the tool looks like, but prevent interaction.

### Implementation Example
```tsx
// Check configuration state
const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

return (
  <div className="space-y-6">
    {/* Warning Banner */}
    {isConfigured === false && (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-destructive">
              {t('notConfigured')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('configureHint')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={goToSettings}>
            <Settings className="mr-2 h-4 w-4" />
            {t('goToSettings')}
          </Button>
        </div>
      </div>
    )}

    {/* Main Tool UI (Disabled) */}
    <div className="flex ...">
       {/* ... inputs with disabled={!isConfigured} ... */}
    </div>
  </div>
);
```
