## Code style:
  - Identifiers should use camel case
  - Indentation should be a double space
  - Braces should be explicitly included
  - Braces should be on the same line as the statement
  - Conditions should have a space between them and the keyword
    - For example, `if (condition) {`, not `if(condition) {`
  - Every line should end with a semi-colon

## Branching policy:
  - All changes must be done via branching
    - Keep branches focused and limited in scope, to allow merging them quickly and efficiently
  - Features should be prefixed with `feature/`
  - Bug fixes should be prefixed with `bugfix/`
  - Merge requests should be filed against `dev`
    - At the end of each sprint, `dev` will be merged into `main`
  - Merge requests must be approved by at least 1 other person before merging, ideally more
