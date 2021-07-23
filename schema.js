const {gql} = require('apollo-server');
const typeDefs = gql`
  type Category{
    picsrc:String
    name: String!
    detail: String
    products(limit:Int!,skip:Int): [Product]!
  }
  type Product{
    id: String!
    slug: String!
    name: String!
    amount: Int!
    price: Float!,
    picsrc: String,
    detail_name: String
    company_name: String
    category: String!
    poster_info:String
  }
  input ProductInput{
    name: String!
    amount: Int!
    price: Float!
    picsrc: String
    detail_name: String
    company_name: String
    category: String!
    poster_info:String
    password:String
  }
  input ProductUpdate{
    name: String
    amount: Int
    price: Float
    picsrc: String
    detail_name: String
    company_name: String
    category: String
    poster_info:String
    password:String
  }
  input ProductSort{
    name:Boolean
    amount:Boolean
    price:Boolean
    company_name:Boolean
    category:Boolean
    poster_info:Boolean
  }
  input ProductRangeSearch{
    amount:Int
    price:Float
  }
  input ProductLikeSearch{
    name:String
    detail_name:String
    company_name:String
    category:String
    poster_info:String
  }
  input CategoryInput{
    picsrc:String
    name: String!
    detail: String
  }
  input CategoryLikeSearch{
    detail:String
  }
  input CategorySort{
    name:Boolean
  }
  type Query {
    products(limit:Int,skip:Int,likeSearch:ProductLikeSearch,minSearch:ProductRangeSearch,maxSearch:ProductRangeSearch,sort:ProductSort):[Product!]
    product(slug:String,id:String):Product
    categories(limit:Int,skip:Int,likeSearch:CategoryLikeSearch,sort:CategorySort):[Category!]
    category(name:String!):Category
  }
  type Mutation {
    addProduct(newProduct:ProductInput!):Product!
    patchProduct(slug:String,Id:String,updatedProduct:ProductUpdate!,password:String):Product!

    addCategory(newCategory:CategoryInput!):Category!
  }
  type Subscription{
    productAdded: Product
  }
`
module.exports = typeDefs;