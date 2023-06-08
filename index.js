const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middlewire
app.use(cors())
app.use(express.json())


 const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
 const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4gqmum7.mongodb.net/?retryWrites=true&w=majority`;
 
 // Create a MongoClient with a MongoClientOptions object to set the Stable API version
 const client = new MongoClient(uri, {
   serverApi: {
     version: ServerApiVersion.v1,
     strict: true,
     deprecationErrors: true,
   }
 });
 
 async function run() {
   try {
     // Connect the client to the server	(optional starting in v4.7)
     await client.connect();



     const studentCollection = client.db("studentDb").collection("student");

     app.get('/student', async(req, res)=>{
       const result = await studentCollection.find().toArray();
       res.send(result)
     })
     app.post('/student', async(req, res)=>{
       const user = req.body;
       const query = {email: user.email}
       const existingUser = await studentCollection.findOne(query);
       if(existingUser){
         return res.send({message: 'user alredy exists'})
       }
       const result = await studentCollection.insertOne(user);
       res.send(result);
     })
     
     app.get('/student/admin/:email', async (req, res)=>{
       const email = req.params.email;
       const query = {email: email}
       const user = await studentCollection.findOne(query);
       console.log(user)
       const result = {admin: user?.role === 'admin'}
       res.send(result);
     })
     app.get('/student/instructor/:email', async (req, res)=>{
       const email = req.params.email;
       const query = {email: email}
       const user = await studentCollection.findOne(query);
       console.log(user)
       const result = {admin: user?.role === 'instructor'}
       res.send(result);
     })
     
     app.patch('/student/admin/:id', async (req, res)=>{
       const id = req.params.id;
       const filter = {_id: new ObjectId(id)}
       const updateDoc ={
         $set:{
           role:'admin'
         },
       };
       const result= await studentCollection.updateOne(filter, updateDoc);
       res.send(result)
     })
     app.patch('/student/instructor/:id', async (req, res)=>{
       const id = req.params.id;
       const filter = {_id: new ObjectId(id)}
       const updateDoc ={
         $set:{
           role:'instructor'
         },
       };
       const result= await studentCollection.updateOne(filter, updateDoc);
       res.send(result)
     })

     //instructor
     

     // Send a ping to confirm a successful connection
     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
     // Ensures that the client will close when you finish/error
    //  await client.close();
   }
 }
 run().catch(console.dir);
 
  


app.get('/', (req, res)=>{
    res.send('drowing school is running')
})
app.listen(port, ()=>{
    console.log(`drowing school on port ${port}`)
})











