# Module `graphql`.

This module provides the tools to create the best GraphQL API for your application. The framework
has a clear separation between the shape of your external GraphQL API, and the internal
representation of your data.

## Temp Ideas

These are some ideas of how the framework will work. Hopefully.

### Schema

The schema is the main component of the GraphQL API. It defines the types, queries, mutations and
subscriptions that the API will have.

```ts
// Scalars
const DateScalar = scalarType({
  name: 'Date',
  description: 'A date',
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value),
  parseLiteral: (ast) => new Date(ast.value),
});

const scalars = {
  ...defaultScalars,
  date: DateScalar.
};

// Types
const t = typings(scalars);

// Object types
const Book = objectType({
  name: 'Book',
  description: 'A book',
  fields: {
    id: t.id('The id of the book'),
    title: t.string('The title of the book'),
    description: t.string('A description of the book'),
    tags: t.list.string('Tags associated with the book'),
    author: t
      .field('The author of the book')
      .of(() => Author)
      .resolve((parent) => authors.find((author) => author.id === parent.authorId)),
  },
});

// Typescript type of the object type
export type BookShape = Infer<typeof Book>;

// Relations
const Author = objectType({
  name: 'Author',
  description: 'An author',
  fields: {
    id: t.id('The id of the author'),
    name: t.string('The name of the author'),
    books: t.list
      .field('The books written by the author')
      .of(() => Book)
      .args({
        limit: t.arg.optional.number.default(3),
      })
      .resolve((parent, args) =>
        books.filter((book) => book.authorId === parent.id).slice(0, args.limit)
      ),
  },
});

// Typescript type of the object type
export type AuthorShape = Infer<typeof Author>;

// Queries
const AuthorQuery = queryField({
  name: 'author',
  description: 'Get an author by id',
  type: Author,
  resolver: t
    .args({
      id: t.arg.int,
    })
    .resolve((_, args) => authors.find((author) => author.id === args.id)),
});

const schema = buildSchema({
  scalars,
  types: [Book, Author, AuthorQuery],
});
```
