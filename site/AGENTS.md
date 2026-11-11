<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- The APEX storefront UI lives in src/app (components, context, data, hooks, pages); route files in src/routes are thin wrappers, and the shared shell (nav, cart, footer) wraps <Outlet /> in __root via AppShell — keeps the imported app's structure intact.
