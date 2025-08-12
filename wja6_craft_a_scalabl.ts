import * as express from 'express';
import * as mongoose from 'mongoose';
import * as nodemailer from 'nodemailer';

interface ModelNotification {
  modelId: string;
  notificationType: string;
  notificationMessage: string;
}

interface ScalableModel {
  id: string;
  name: string;
  description: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
  };
}

const app = express();

mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });

const ScalableModelSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  metrics: {
    accuracy: Number,
    precision: Number,
    recall: Number,
  },
});

const ScalableModel = mongoose.model('ScalableModel', ScalableModelSchema);

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false, // or 'SSL'
  auth: {
    user: 'username',
    pass: 'password',
  },
});

app.post('/notify', async (req, res) => {
  const notification: ModelNotification = req.body;
  const scalableModel: ScalableModel = await ScalableModel.findById(notification.modelId);
  if (scalableModel) {
    const mailOptions = {
      from: 'machinelearning@example.com',
      to: 'admin@example.com',
      subject: `Machine Learning Model Notification - ${scalableModel.name}`,
      text: notification.notificationMessage,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
    res.status(201).send({ message: 'Notification sent successfully' });
  } else {
    res.status(404).send({ message: 'Model not found' });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});