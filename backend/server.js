import express from 'express'
import cors from 'cors'
import {open} from 'sqlite'

import sqlite3 from 'sqlite3'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())

const dbPath  = path.join(process.cwd(),'Data.db')
let db = null;
const initializeDb =async()=>{
   try{
    db= await open({
        filename:dbPath,
        driver:sqlite3.Database
    });
    await db.run(
       ` CREATE TABLE IF NOT EXISTS NOTE(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE,
            heading TEXT NOT NULL,
            text Text NOT NULL,
            priority Text NOT NULL,
            last_edited Text,
            pinned INTEGER DEFAULT 0,
            archieve INTEGER DEFAULT 0
            
        
            

        )`,
        
    );

    

    
app.listen(3000,()=>{
    console.log('server is running at port 3000')
})  
   }catch(error){
    console.error('Error opening db :', error)
   }
}


//NOTE ROUTES

app.post('/notes',async(req,res)=>{
    try{
    const {date,heading,text,priority,pinned,archieve}  = req.body;
    const last_edited = new Date().toISOString();

    const sqlQuery  = `
        INSERT INTO NOTE (date,heading,text,priority,last_edited) values(?,?,?,?,?)
    `
    const result =await db.run(sqlQuery,[date,heading,text,priority,last_edited ])
    res.status(201).json({message:'Note added successfully'})

    }catch(e){
        res.status(500).json({error:e.message})
    }

});


//GET ALL NOTES

app.get('/notes',async(req,res)=>{
    try{
    const query = `select * from NOTE` 
    
    const noteResponse = await db.all(query)
    
    res.status(200).json(noteResponse)
    // console.log(noteResponse)
}catch(e){
    res.status(500).json('unable to fetch reviews')
}
})


// DELETE NOTES BY ID
app.delete("/notes/:ID",async(req,res)=>{
    const {ID} = req.params
    try{
    const query = `DELETE FROM NOTE WHERE ID=?`
    const result = await db.run(query,[ID])
    if (result.changes===0){
        res.status(404).json({message:'note not found'})
    }
    res.status(201).json({message:"note deleted successfully"})
    }catch(e){
        res.status(500).json({error:e.message})
    }
})


//UPDATE NOTE BY ID
app.put("/notes/:ID",async(req,res)=>{
    const {ID} = req.params
    const {date,heading,text,priority,pinned,archieve}= req.body
    const last_edited = new Date().toISOString()
    try{
    

    const sqlQuery = `
            UPDATE NOTE
            SET date = ?, heading = ?, text = ?, priority = ?,last_edited=?,pinned=?,archieve=?
            WHERE ID = ?
        `;

    const result =await db.run(sqlQuery,[date,heading,text,priority,last_edited, pinned ? 1:0,archieve?1:0,ID])
    if (result.changes ===0 ){
        return res.status(404).json({message:"Note not found"})
    }
    res.status(200).json({message:"Note updated successfully"})
}catch(e){
    res.status(500).json({error:e.message})
}

})

//START DB AND SERVER

initializeDb()
