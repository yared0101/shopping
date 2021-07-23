const {v4} = require("uuid");
const pgp = require('pg-promise')();
const error = require('../error')
const checker={
    checkPrice:(price)=>{
        if(price<0)
            throw error("price should't be negative","price")
    },
    checkAmount:(amount)=>{
        if(amount < 0)
            throw error("amount should't be negative","amount")
    },
    checkName:(name)=>{
        if(name.length<3)
            throw error('name must be atleast 4 length','name')
    }
}
const Mutation={
    addProduct: async(_, {newProduct}, {db,productColNames})=>{
        
        const {checkPrice,checkAmount} = checker;
        
        const name = newProduct.name.toLocaleLowerCase()
        checkPrice(newProduct.price)
        checkAmount(newProduct.amount)
        const myName = name.replace(/_/g,' ')
        const slugQuery = pgp.as.format("SELECT COUNT(name) FROM product WHERE name = $1",[myName])
        const slug = name.replace(/ /g,'_')+'_'
        const id = v4()
        const toBeInputted ={...newProduct,id,name:myName}
        try{
            return await db.one("INSERT into product(slug,$1:name) values($2||($3:raw)::text,$1:csv) RETURNING $4:name",[toBeInputted,slug,slugQuery,productColNames]);
        }catch(e){
            let temp = null;
            try{
                if(e.code == '23503'){
                    temp = e.detail.split(')')[0];
                    temp = temp.split('(')[1];
                }    
            }catch{
                temp = null;
            }
            if(temp)
                throw error(`No such ${temp}`,temp)
            else
                throw "error happened while adding product"
        }
    },
    patchProduct: async(_,{slug,id,updatedProduct,password},{db,productColNames})=>{
        if(!slug && !id)
            throw error("either slug or id must be given","identifier");
        password = password||""
        let identifier;
        if(slug){
            slug = slug.toLocaleLowerCase()
            identifier={slug}
        }
        else{
            identifier={id}
        }
        const {checkPrice,checkAmount} = checker;
        
        updatedProduct.price && checkPrice(updatedProduct.price)
        updatedProduct.amount && checkAmount(updatedProduct.amount)
        if(updatedProduct.name){
            updatedProduct.name = updatedProduct.name.replace(/_/g,' ').toLocaleLowerCase()
        }

        try{
            var realPassword = await db.one("SELECT password FROM product WHERE $1:name = $1:csv",[identifier]);
        }catch(e){
            let key = ''
            for (let i in identifier){
                key = i;
                break;
            }
            throw error("Product doesn't exist",key)
        }
        if(realPassword.password){
            if(password != realPassword.password)
                throw error("Password incorrect","Password")
        }
        const supposedData ={
            name:1,
            amount:1,
            price:1,
            picsrc:1,
            detail_name:1,
            company_name:1,
            category:1,
            poster_info:1,
            password:1
        }
        let sendOffUserData={};
        for(let i in supposedData){
            if(updatedProduct[i])
                sendOffUserData[i] = updatedProduct[i]
        }
        let query = "";
        for(let i in sendOffUserData){
            if(query)
                query+=', '
            query+=pgp.as.format("$1:name = $2 ",[i,sendOffUserData[i]])
        }
        if(!query)
            throw error("No data sent for update","updatedProduct","BAD_PROGRAMMER_INPUT")
        query = "UPDATE product SET "+query;
        query+=pgp.as.format("WHERE $1:name = $1:csv RETURNING $2:name",[identifier,productColNames]);
        try{
            return await db.one(query);
        }catch(e){
            let temp = null;
            try{
                if(e.code == '23503'){
                    temp = e.detail.split(')')[0];
                    temp = temp.split('(')[1];
                }    
            }catch{
                temp = null;
            }
            if(temp)
                throw error(`No such ${temp}`,temp)
            else
                throw e
        }
    },
    addCategory: async(_, {newCategory}, {db,categoryColNames})=>{
        const {checkName} = checker;
        newCategory.name = newCategory.name.toLocaleLowerCase()
        checkName(newCategory.name);
        const query=pgp.as.format("INSERT INTO category($1:name) VALUES($1:csv) RETURNING $2:name",[newCategory,categoryColNames])
        try{
            return await db.one(query);
        }catch(e){
            let temp = null;
            try{
                if(e.code == '23505'){
                    temp = e.detail.split(')')[0];
                    temp = temp.split('(')[1];
                }    
            }catch{
                temp = null;
            }
            if(temp)
                throw error("Value already exists",temp)
            else
                throw "Error While Adding"
        }
    },
}
module.exports = Mutation;

/*
removeProduct: async(_,{slug,id},{db,productColNames})=>{
        if(!slug && !id)
            throw error("either slug or id must be given","identifier");
        let identifier;
        if(slug){
            identifier={slug}
        }
        else{
            identifier={id}
        }
        try{
            console.log(pgp.as.format("DELETE FROM PRODUCT WHERE $1:name = $1:csv RETURNING $2:name",[identifier,productColNames]))
            return await db.one("DELETE FROM PRODUCT WHERE $1:name = $1:csv RETURNING $2:name",[identifier,productColNames]);
        }catch{
            return null;
        }
    },
    removeCategory: async(_,{name},{db})=>{
        return null;
    },
    patchCategory: async(_,{name,updatedCategory},{db})=>{
        return null;
    },
 */

// type Animal{
//     id:ID!,
//     image: String!
//     title: String!
//     rating: Float!
//     price: String!
//     description:[String!]!
//     stock: Int!
//     slug: String!
//     category: Category!
//     onSale: Boolean
//   }