const error = require('../error')
const pgp = require('pg-promise')();
const returnNormalizedQuery = (rawSqlLikeSearch,tableName,minSearch,maxSearch,sort)=>{
    let rawSqlSort='';
    let rawSqlRangeSearch='';
    for (let i in sort){
        if(rawSqlSort)
            rawSqlSort+=', '
        if(sort[i])
            rawSqlSort+=pgp.as.format('$1:name ASC',i)
        else
            rawSqlSort+=pgp.as.format('$1:name DESC',i)
    }
    rangeColumns={};
    for(let i in minSearch){
        rangeColumns[i]=1;
    }
    for(let i in maxSearch){
        rangeColumns[i]=1;
    }
    for (let i in rangeColumns){
        if(minSearch[i]){
            if(rawSqlRangeSearch)
                rawSqlRangeSearch+=' AND '
            rawSqlRangeSearch+=pgp.as.format('$1:name > $2',[i,minSearch[i]])
        }
        if(maxSearch[i]){
            if(rawSqlRangeSearch)
                rawSqlRangeSearch+=' AND '
            rawSqlRangeSearch+=pgp.as.format('$1:name < $2',[i,maxSearch[i]])
        }
    }
    let tableQuery = pgp.as.format('FROM $1:name ',[tableName])
    let query='SELECT $3:name '+tableQuery;
    if(rawSqlLikeSearch || rawSqlRangeSearch){
        query+=' WHERE ';
        if(rawSqlLikeSearch && rawSqlRangeSearch){
            query+='$5:raw AND $6:raw '
        }
        else if(rawSqlLikeSearch){
            query+='$5:raw '
        }
        else{
            query+='$6:raw '
        }
    }
    if(rawSqlSort){
        query+='ORDER BY $4:raw '
    }
    query+="LIMIT $1 OFFSET $2";
    return {query,rawSqlSort,rawSqlRangeSearch};
}
const Query={
    products: async (_,{limit,skip,likeSearch,minSearch,maxSearch,sort},{db,productColNames}) => {
        const MAX_LIMIT=20
        //sort data is a valid data
        limit = limit > 20? MAX_LIMIT:limit
        skip = skip||0
        minSearch = minSearch || {}
        maxSearch = maxSearch || {}
        likeSearch = likeSearch || {}

        let rawSqlLikeSearch="";
        for (let i in likeSearch){
            if(likeSearch[i]){
                if(rawSqlLikeSearch)
                    rawSqlLikeSearch+=' AND '
                let searchable ='%'+likeSearch[i]+'%'
                rawSqlLikeSearch+=pgp.as.format('$1:name ILIKE $2',[i,searchable])
            }
        }
        const {query,rawSqlSort,rawSqlRangeSearch} = returnNormalizedQuery(rawSqlLikeSearch,'product',minSearch,maxSearch,sort);
        try{
            return await db.any(query,[limit,skip,productColNames,rawSqlSort,rawSqlLikeSearch,rawSqlRangeSearch]);
        }catch(e){
            throw "something went wrong while querying"
        }
    },
    product: async(_,{slug,id},{db,productColNames}) =>{
        if(!slug && !id)
            throw error("either slug or id must be given","identifier");
        let identifier;
        if(slug){
            identifier={slug}
        }
        else{
            identifier={id}
        }
        const query = pgp.as.format("SELECT $1:name from product where $2:name = $2:csv",[productColNames,identifier])
        try{
            return await db.one(query);
        }catch(e){
            throw "something went wrong while querying"
        }
    },
    categories: async(_,{limit,skip,likeSearch,sort},{db,categoryColNames})=> {
        const MAX_LIMIT=20
        //sort data is a valid data
        limit = limit > 20? MAX_LIMIT:limit
        skip = skip||0
        minSearch = {}
        maxSearch = {}
        likeSearch = likeSearch || {}
        let rawSqlLikeSearch="";
        for (let i in likeSearch){
            if(likeSearch[i]){
                if(rawSqlLikeSearch)
                    rawSqlLikeSearch+=' AND '
                let searchable ='%'+likeSearch[i]+'%'
                rawSqlLikeSearch+=pgp.as.format('$1:name ILIKE $2',[i,searchable])
            }
        }
        const {query,rawSqlSort,rawSqlRangeSearch} = returnNormalizedQuery(rawSqlLikeSearch,'category',minSearch,maxSearch,sort);
        try{
            return await db.any(query,[limit,skip,categoryColNames,rawSqlSort,rawSqlLikeSearch,rawSqlRangeSearch]);
        }catch(e){
            throw "something went wrong while querying"
        }
    },
    category: async(_,{name},{db,categoryColNames})=>{
        if(!name)
            throw error("name must be given","name");
        const identifier={name}
        const query = pgp.as.format("SELECT $1:name from category where $2:name = $2:csv",[categoryColNames,identifier])
        try{
            return await db.one(query);
        }catch(e){
            throw "something went wrong while querying"
        }
    },
}
module.exports= Query;