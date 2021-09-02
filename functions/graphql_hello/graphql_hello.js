const { ApolloServer, gql } = require("apollo-server-lambda");

var faunadb = require('faunadb'),
  q = faunadb.query;



const typeDefs = gql`
type Todo {
  task: String!
  id: ID!
}
type Mutation {
  addTodo(task: String!): Todo
  delTodo(id: ID!): Todo
}  
type Query {
    to_dos: [Todo!]
  }
  
`


const resolvers = {
  Query: {
    to_dos: async (root, args, context) => {
      try {
        var adminClient = new faunadb.Client({ secret: 'fnAERSkuizACRFtz7ioe5sC1Nav8WRKw3q0N_omf' });
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index('task'))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map(d => {
          return {
            id: d.ref.id,
            task: d.data.task,
          }
        })
      }
      catch (err) {
        console.log(err)
      }
    }
  },
  Mutation: {
    addTodo: async (_, {task}) => {
      try {
        var adminClient = new faunadb.Client({ secret: 'fnAERSkuizACRFtz7ioe5sC1Nav8WRKw3q0N_omf' });
        const result = await adminClient.query(
          q.Create(
            q.Collection('todos'),
            {
              data: {
                task: task,
              }
            },
          )
        )
        return result.ref.data;
      }
      catch (err) {
        console.log(err)
      }
    },

    delTodo: async (_, args ) => {
      console.log(args.id)
      try {
        var adminClient = new faunadb.Client({ secret: 'fnAERSkuizACRFtz7ioe5sC1Nav8WRKw3q0N_omf' });
        const result = await adminClient.query(
          q.Delete(
            q.Ref(q.Collection('todos'), args.id  )
          )
        )
        return result.ref.data;
      }
      catch (err) {
        console.log(err)
      }
    }
  }
}
const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true
});

exports.handler = server.createHandler();