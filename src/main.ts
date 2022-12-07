import path from 'path';
import express, { Express, NextFunction, Request, Response } from 'express';
import { serverInfo } from './ServerInfo';
import * as IMAP from './IMAP';
import * as SMTP from './SMTP';
import * as Contacts from './Contacts';
import { IContact } from './Contacts';
import { ids } from 'webpack';

const app: Express = express();

app.use(express.json());

app.use('/', express.static(path.join(__dirname, '../../client/dist')));

app.use(function (
  inRequest: Request,
  inResponse: Response,
  inNext: NextFunction
) {
  inResponse.header('Access-Control-Allow-Origin', '*');
  inResponse.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  inResponse.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept'
  );
  inNext();
});
app.get('/mailboxes', async (inRequest: Request, inResponse: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    inResponse.json(mailboxes);
  } catch (inError) {
    inResponse.send(inError);
  }
});

app.get(
  '/mailboxes/:mailbox',
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const messages: IMAP.IMessage[] = await imapWorker.listMessages({
        mailbox: inRequest.params.mailbox,
      });
      inResponse.json(messages);
    } catch (inError) {
      inResponse.send('error');
    }
  }
);

app.get(
  '/messages/:mailbox/:id',
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const messageBody: string = await imapWorker.getMessageBody({
        mailbox: inRequest.params.mailbox,
        id: parseInt(inRequest.params.id, 10),
      });
      inResponse.send(messageBody);
    } catch (inError) {
      inResponse.send('error');
    }
  }
);

app.delete(
  '/messages/:mailbox/delete',
  async (inRequest: Request, inResponse: Response) => {
    const idArray = inRequest.body.ids;
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    idArray.forEach(async (id: number) => {
      try {
        await imapWorker.deleteMessage({
          mailbox: inRequest.params.mailbox,
          id: id,
        });
      } catch (inError) {
        inResponse.send('error');
        return;
      }
    });
    const messages: IMAP.IMessage[] = await imapWorker.listMessages({
      mailbox: inRequest.params.mailbox,
    });
    inResponse.json(messages);
  }
);

app.post('/messages', async (inRequest: Request, inResponse: Response) => {
  try {
    const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
    await smtpWorker.sendMessage(inRequest.body);
    inResponse.send('ok');
  } catch (inError) {
    inResponse.send('error');
  }
});

app.post('/contacts', async (inRequest: Request, inResponse: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contact: IContact = await contactsWorker.addContact(inRequest.body);
    inResponse.json(contact);
  } catch (inError) {
    inResponse.send('error');
  }
});

app.delete(
  '/contacts/:id',
  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      await contactsWorker.deleteContact(inRequest.params.id);
      inResponse.send('ok');
    } catch (inError) {
      inResponse.send('error');
    }
  }
);
app.listen(3002, () => {
  console.log('MailBag server open for requests');
});
