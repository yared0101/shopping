const {mainCards,animals, categories, tableContent, users} = require('./db')
const { ApolloServer } = require('apollo-server')
const pgp = require('pg-promise')();
const { PubSub } = require("graphql-subscriptions");

try{
    const cn = {
        connectionString: 'postgres://postgres:postgres@localhost:5432/shopping',
        max: 30
    };
    var db = pgp(cn);
}
catch(e){
    var db="Failure";
    console.log(db);
    console.log(e)
}
const pubsub = new PubSub();
const typeDefs = require('./schema')

const Query = require('./resolvers/Query')
const Category = require('./resolvers/Category')
const Mutation = require('./resolvers/Mutation')

const productColNames = {
    id: 1,
    slug: 1,
    name: 1,
    amount: 1,
    price: 1,
    picsrc: 1,
    detail_name: 1,
    company_name: 1,
    category: 1,
    poster_info:1,
}
const categoryColNames = {
    picsrc:1,
    name:1,
    detail:1
}

const server = new ApolloServer({

    subscriptions:{
        path: '/subscriptions'
    },
    typeDefs,
    resolvers:{
        Query,
        Category,
        Mutation,
    },
    context:{
        db,
        productColNames,
        categoryColNames
    }
});

server.listen().then(({url})=>{
    console.log(`server ready at ${url}`)
})