# ikasue implementation specification

## Product intent

ikasue applies a planar visual and interaction language to ordinary web layout. It keeps information readable during work, gives selected work area, matches motion to the direction of appearance, and prefers in-flow regions over floating surfaces.

## Public layers

Layout primitives are Flex, Stack, Grid, ScrollArea, and Separator. Interactive components are Tabs, Sidebar, Toolbar, IconButton, Text, TextField, EditableText, Checkbox, RadioGroup, SegmentedControl, Field, Form, DataGrid, StatusIndicator, Alert, Progress, Dialog, and HistoryTimeline. Workspace patterns are SplitView, SidePanel, BottomPanel, and LoadingRegion. ThemeRoot owns the visual tokens.

CSS resolves grow, shrink, basis, wrap, gap, alignment, overflow, and responsive container behavior. The package descriptors never calculate offsets, extents, available units, collapse replacement, or generated navigation.

## Behavioral principles

- Flat surfaces and semantic color keep the canvas readable.
- A selected work area can receive more space without adding a card hierarchy.
- Loading preserves the original content and adds busy/progress semantics.
- SidePanel and BottomPanel are in-flow; Dialog is reserved for a truly modal decision.
- Keyboard order follows DOM order and reduced motion removes transition duration.
- Tabs, DataGrid, ScrollArea, and SplitView each own their distinct interaction or overflow behavior.

## Documentation

Japanese and English docs are authored as fixed mirrored source pages. The route inventory is stored in scripts/catalog-routes.json and checked without directory discovery. The package is pre-v1, so the current public contract is intentionally direct.
