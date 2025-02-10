import { Context } from '@osaas/client-core';
import {
  createApacheCouchdbInstance,
  getApacheCouchdbInstance
} from '@osaas/client-services';
import nano, { MaybeDocument } from 'nano';

async function setup() {
  const ctx = new Context();
  let instance = await getApacheCouchdbInstance(ctx, 'example');
  if (!instance) {
    instance = await createApacheCouchdbInstance(ctx, {
      name: 'example',
      AdminPassword: 'secret'
    });
  }
  const url = new URL(instance.url);
  url.password = instance.AdminPassword;
  url.username = 'admin';
  const client = nano(url.toString());
  const db = await client.db.get('example');
  if (!db) {
    await client.db.create('example');
  }
  return client.db.use('example');
}

interface PersonDoc extends MaybeDocument {
  firstName: string;
  lastName: string;
}

class Person implements PersonDoc {
  public _id?: string;
  public _rev?: string;
  constructor(public firstName: string, public lastName: string) {}
}

async function main() {
  const db = await setup();
  const person = new Person('John', 'Doe');
  const doc = await db.insert(person);
  if (doc.ok) {
    person._id = doc.id;
    person._rev = doc.rev;
  }
}

main();
