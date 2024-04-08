import mongoose from "mongoose";

export default async function connectDb() {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then((data) => {
      console.log(`Mongoose connected to ${data.Connection.name}`);
    })
    .catch((error) => {
      console.log(`Mongo DB Error:  ${error.message}`);
    });
}
