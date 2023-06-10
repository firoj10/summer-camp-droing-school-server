const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
     const classCollection = client.db("studentDb").collection("class");
     const selectclassCollection = client.db("studentDb").collection("selectclass");
     const paymentsCollection = client.db("studentDb").collection("payments");


     //studentCollection
     app.get('/student', async(req, res)=>{
       const result = await studentCollection.find().toArray();
       res.send(result)
     })

     app.get('/student/instructor/:role', async (req, res) => {
      const role = req.params.role;
      const instructor = { role: 'instructor' }; 
      const user = await studentCollection.find(instructor).toArray();
      console.log(user)
      res.send(user);
    });
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
       const result = {admin: user?.role === 'admin'}
       res.send(result);
     })
     app.get('/student/instructor/:email', async (req, res)=>{
       const email = req.params.email;
       const query = {email: email}
       const user = await studentCollection.findOne(query);
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

   

     //classCollection
     app.post('/addclass', async(req, res)=>{
      const user = req.body;
      const result = await classCollection.insertOne(user);
      res.send(result);
    })

    app.get('/allclass', async(req, res)=>{
      const result = await classCollection.find().toArray();
      res.send(result)
    })
  
    app.patch('/allclass/:status', async (req, res)=>{
      const status = req.params.status;
      const filter = {status: 'pending'}
      const updateDoc ={
        $set:{
          status:'approve'
        },
      };
      const result= await classCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.get('/allclass/approve', async (req, res) => {
      const status = req.query.status;
      const query = { status: 'approve' };
      
      if (status === 'panding') {
        res.send([]);
      } else {
        const result = await classCollection.find(query).toArray();
        res.send(result);
      }
    });

    //selected class collection alll and final

    app.get('/selectclass/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await selectclassCollection.find(query).toArray();
      res.send(result);
    });







    app.post('/selectclass', async(req, res)=>{
      const item = req.body;
      console.log(item)
      const result = await selectclassCollection.insertOne(item);
      res.send(result);
    })
     
    app.delete('/selectclass/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await selectclassCollection.deleteOne(query);
      res.send(result);
    })




//
//create payment intent
app.post("/create-payment-intent", async (req, res) => {
  const booking = req.body;
  const price = booking.price;
  const amount = price * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    currency: "usd",
    amount: amount,
    payment_method_types: ["card"],
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.post("/payments", async (req, res) => {
  const payment = req.body;
  const result = await paymentsCollection.insertOne(payment);
  const id = payment.bookingId;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      paid: true,
      transactionId: payment.transactionId,
    },
  };
  const updatedResult = await classCollection.updateOne(
    filter,
    updatedDoc
  );
  res.send(result);
});
  







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











