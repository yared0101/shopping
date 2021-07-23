const pgp = require('pg-promise')();
const Category = {
    products:async(parent,{limit,skip},{db,productColNames})=>{
        const MAX_LIMIT = 20;
        limit = limit > MAX_LIMIT? MAX_LIMIT:limit
        skip = skip||0
        const query = pgp.as.format("SELECT $1:name FROM product WHERE category = $2 LIMIT $3 OFFSET $4",[productColNames,parent.name,limit,skip])
        console.log(query)
        try{
            return await db.any(query);
        }catch{
            return [];
        }
    }
}
module.exports = Category;