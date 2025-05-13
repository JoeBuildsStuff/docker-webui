# Refactoring Guide: Docker Images Feature

## 1. Goal

The primary goal of this refactoring task is to align the architecture, components, and data flow of the Docker Images feature (`/app/images`, `/components/images`, `/api/images`) with the patterns established in the Payments feature (`/app/data-table`, `/components/payments`, `/api/payments`).

This involves adopting key libraries and patterns for consistency, maintainability, and improved user experience.

## 2. Reference Implementation

The `src/components/payments/*` directory serves as the reference implementation for the target architecture. Key files include:

*   `data-table-payments.tsx` (Main component using `useReactTable` and `useQuery`)
*   `data-table-payments-columns.tsx` (Column definitions)
*   `data-table-payments-actions.tsx` (Global table actions)
*   `data-table-payments-skeleton.tsx` (Loading state)
*   `types.ts` (Data type definitions)

## 3. Key Libraries & Patterns

*   **`@tanstack/react-table`:** For core table logic including sorting, filtering (optional), pagination, column visibility, and row selection.
*   **`@tanstack/react-query`:** For server state management - fetching, caching, and updating data from the API. Use `useQuery` for fetching lists and `useMutation` for actions (delete, pull).
*   **Component Structure:** Maintain a clear separation of concerns:
    *   Main Table Component (`data-table-images.tsx`)
    *   Column Definitions (`data-table-images-columns.tsx`)
    *   Global Actions (`images-actions.tsx` - integrated into the main table)
    *   Row Actions (`image-actions.tsx` - integrated into columns)
    *   Skeleton Loader (`data-table-images-skeleton.tsx`)
    *   Type Definitions (`types.ts`)
*   **UI Components:** Utilize `shadcn/ui` components (`Table`, `Button`, `Dialog`, `Checkbox`, `Skeleton`, `Badge`, `Alert`, etc.) consistently.
*   **API Routes:** Next.js API routes for backend interactions (`docker` commands).

## 4. Refactoring Steps

Follow these steps sequentially. Each step includes a checkpoint to verify progress before moving on.

### Step 1: Setup & Types

*   **Task:** Define the data structure for Docker images.
*   **Action:**
    *   Create `src/components/images/types.ts`.
    *   Define and export a `DockerImage` interface/type based on the actual data returned by the `GET /api/images` endpoint (currently defined inline in `images-list.tsx`). Ensure all necessary fields (`ID`, `Repository`, `Tag`, `CreatedAt`, `Size`) are included with correct types.
    *   Verify `@tanstack/react-table` and `@tanstack/react-query` are installed project dependencies.

*   **Checkpoint:** `src/components/images/types.ts` exists and accurately defines the `DockerImage` structure.

### Step 2: API Enhancements

*   **Task:** Ensure API routes exist and function correctly for all required image operations.
*   **Action:**
    *   **Review GET:** Examine `src/app/api/images/route.ts` (GET method). Confirm it reliably returns an array of image objects matching the `DockerImage` type. Pay attention to the `CreatedAt` field format (string is expected).
    *   **Create DELETE:** Create `src/app/api/images/[id]/route.ts`. Implement the `DELETE` HTTP method handler. This handler should:
        *   Extract the image `id` from the URL parameters.
        *   Execute `docker rmi <id>` using `execAsync`. *Caution:* Ensure proper input sanitization/validation to prevent command injection vulnerabilities. Consider using the full image ID.
        *   Handle potential errors from the `docker` command (e.g., image not found, image in use) and return appropriate error responses (e.g., 404, 409, 500).
        *   Return a success response (e.g., 200 OK or 204 No Content) on successful deletion.
    *   **Create POST (for Pull):** Add a `POST` method handler to `src/app/api/images/route.ts`. This handler should:
        *   Expect the image name (e.g., `nginx:latest`) in the request body.
        *   Execute `docker pull <imageName>` using `execAsync`. Validate the input image name.
        *   Handle errors during the pull process (e.g., image not found on registry, network issues) and return appropriate error responses.
        *   Return a success response on completion.

*   **Checkpoint 1:** API routes for GET (list), DELETE (remove by ID), and POST (pull image) are implemented and can be tested successfully using tools like `curl` or Postman. Error handling is in place.

### Step 3: Column Definitions (`data-table-images-columns.tsx`)

*   **Task:** Define how the image data should be presented and interacted with in table columns.
*   **Action:**
    *   Create `src/components/images/data-table-images-columns.tsx`.
    *   Import `ColumnDef` from `@tanstack/react-table` and the `DockerImage` type.
    *   Export `const columns: ColumnDef<DockerImage>[]`.
    *   Implement column definitions for:
        *   **Selection Checkbox:** Mimic the implementation in `data-table-payments-columns.tsx` for row selection.
        *   **Repository:** Display `image.Repository`. Use `DataTableColumnHeader` for sorting.
        *   **Tag:** Display `image.Tag` using `Badge` component. Use `DataTableColumnHeader`.
        *   **Image ID:** Display a shortened version of `image.ID` (e.g., `image.ID.substring(7, 19)`). Use `font-mono` for style. Use `DataTableColumnHeader`.
        *   **Created:** Display the relative time using the `formatTimeAgo` function (move this function from `images-list.tsx` to a shared utility file, e.g., `src/lib/utils.ts`). Use `DataTableColumnHeader`.
        *   **Size:** Display `image.Size`. Use `DataTableColumnHeader`.
        *   **Actions:** Define a `cell` component for the actions column:
            *   Import and render the existing `ImageActions` component (`src/components/images/image-actions.tsx`).
            *   Pass the full `image.ID` as a prop to `ImageActions`.
            *   **Refactor `ImageActions`:**
                *   Accept the `id` prop.
                *   Use `useMutation` from `react-query` to call the `DELETE /api/images/{id}` endpoint in the `handleRemove` function.
                *   On successful mutation, invalidate the `['images']` query key using `queryClient.invalidateQueries()`.
                *   Handle loading and error states from the mutation.
                *   Remove the `setTimeout` simulation.

*   **Checkpoint 2:** `data-table-images-columns.tsx` is created, defines all columns, and integrates the refactored `ImageActions` component for row deletion using `react-query` mutations.

### Step 4: Main Table Component (`data-table-images.tsx`)

*   **Task:** Create the core table component using `useReactTable` and `useQuery`.
*   **Action:**
    *   Rename `src/components/images/images-list.tsx` to `src/components/images/data-table-images.tsx`.
    *   **Data Fetching:**
        *   Remove `useState` for `images`, `loading`, `error`.
        *   Remove the `useEffect` hook for fetching data.
        *   Implement data fetching using `useQuery({ queryKey: ['images'], queryFn: fetchImages })`.
        *   Define an `async function fetchImages(): Promise<DockerImage[]>` that fetches from `/api/images` and handles response/errors.
    *   **Table Instance:**
        *   Import and use the `useReactTable` hook.
        *   Pass `data` (from `useQuery`, provide default `[]`), `columns` (from `data-table-images-columns.tsx`).
        *   Implement state management for `sorting`, `columnVisibility`, `rowSelection` (copy patterns from `data-table-payments.tsx`).
        *   Include necessary `get*RowModel` functions (`getCoreRowModel`, `getPaginationRowModel`, `getSortedRowModel`, `getFilteredRowModel` if needed).
    *   **Rendering:**
        *   Render the table structure (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) using `table.getHeaderGroups()` and `table.getRowModel().rows`.
        *   Use `flexRender` for rendering header and cell content.
    *   **Integrations:**
        *   Import and render `DataTablePagination` (from `@/components/ui/data-table-pagination`) below the table, passing the `table` instance.
        *   Import and render `DataTableViewOptions` (from `@/components/ui/data-table-view-options`) above the table, passing the `table` instance.
        *   Import and render the `ImagesActions` component (`src/components/images/images-actions.tsx`) above the table (alongside `DataTableViewOptions`).
    *   **Refactor `ImagesActions`:**
        *   Update the "Refresh" button's `onClick` handler to invalidate the `['images']` query using `queryClient.invalidateQueries(['images'])`.
        *   Update the "Pull Image" dialog:
            *   Use `useState` for the input field value.
            *   Use `useMutation` to call the `POST /api/images` endpoint, sending the image name in the body.
            *   On successful mutation, invalidate the `['images']` query.
            *   Provide user feedback (e.g., using `toast`) on success or failure of the pull operation.
            *   Close the dialog (`setOpen(false)`) on submission/success.
    *   **State Handling:**
        *   Use the `isLoading` state from `useQuery` to conditionally render the skeleton component (`data-table-images-skeleton.tsx`).
        *   Use the `error` state from `useQuery` to display an appropriate error message (e.g., using the `Alert` component).
    *   **Cleanup:** Remove old manual table rendering logic. Ensure `formatTimeAgo` is imported from its new utility location.

*   **Checkpoint 3:** `data-table-images.tsx` correctly fetches data using `react-query`, renders the table using `react-table`, integrates pagination, view options, global actions (Refresh, Pull), and row actions (Delete). Core functionality is working.

### Step 5: Skeleton (`data-table-images-skeleton.tsx`)

*   **Task:** Update the loading skeleton to accurately reflect the new table layout.
*   **Action:**
    *   Rename `src/components/images/images-skeleton.tsx` to `src/components/images/data-table-images-skeleton.tsx`.
    *   Modify the skeleton structure to match the layout rendered by `data-table-images.tsx`. This should include placeholders for:
        *   The area containing `ImagesActions` and `DataTableViewOptions`.
        *   Table headers corresponding to the new columns.
        *   Several rows of table cells with appropriate skeleton widths.
        *   The `DataTablePagination` controls area.
    *   Refer closely to `src/components/payments/data-table-payments-skeleton.tsx` for structural guidance.

*   **Checkpoint 4:** The skeleton component accurately represents the loading state of the refactored images table and its surrounding controls.

### Step 6: Page Integration (`page.tsx`)

*   **Task:** Update the images page to use the new data table component.
*   **Action:**
    *   Edit `src/app/images/page.tsx`.
    *   Remove the import and usage of the old `ImagesList`.
    *   Remove the import and usage of `ImagesActions` (it's now integrated within the table component).
    *   Import the refactored `DataTableImages` component (likely the default export from `src/components/images/data-table-images.tsx`).
    *   Render `<DataTableImages />` where `ImagesList` and `ImagesActions` were previously.

*   **Checkpoint 5:** The `/images` page loads successfully and displays the new `DataTableImages` component.

### Step 7: Cleanup & Testing

*   **Task:** Finalize the refactor by cleaning up and testing thoroughly.
*   **Action:**
    *   Delete any redundant or unused files (e.g., the original `images-list.tsx` if not renamed in place).
    *   Ensure the `formatTimeAgo` utility function is correctly placed and imported.
    *   Perform comprehensive testing:
        *   Loading state (skeleton display).
        *   Error state (API errors, Docker command errors).
        *   Data display (correct formatting for all columns).
        *   Sorting on different columns.
        *   Pagination (next, previous, page numbers).
        *   Column visibility toggle.
        *   Row selection (if implemented).
        *   "Refresh" button functionality.
        *   "Pull Image" functionality (including dialog interaction, success/error feedback).
        *   "Delete Image" functionality (including confirmation dialog, success/error feedback).
        *   Responsiveness (if applicable).

## 5. Code Style & Conventions

*   **TypeScript:** Use TypeScript strictly. Leverage defined types (`DockerImage`).
*   **React:** Use functional components and hooks.
*   **TailwindCSS:** Utilize Tailwind for styling, following existing project conventions.
*   **`shadcn/ui`:** Use components from this library for UI elements.
*   **Error Handling:** Implement robust error handling in API routes and frontend mutations/queries. Display user-friendly error messages or use toasts.
*   **State Management:** Use `react-query` for server state and `useState` / `useReducer` for local component/UI state. Avoid mixing server state in local state where `react-query` can manage it. 