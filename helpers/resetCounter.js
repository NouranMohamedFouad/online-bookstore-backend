import mongoose from 'mongoose';

export const reset = async (counterId) => {
  try {
    console.log(counterId);
    await mongoose.connection.db.collection('counters').updateOne(
      {id: counterId},
      {$set: {seq: 0}}
    );
    console.log(`${counterId} counter reset successfully.`);
  } catch (err) {
    console.log(`${counterId} counter does not exist, skipping reset.`);
  }
};
