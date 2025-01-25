# iMessage Manager

This is a POC Mac desktop app that uses AI to:
- Suggest replies to messages (or straight up automatically replies for you if you want it to)
- Reminds you to check up on friends you haven't spoken to in a while
- Automatically translates non-English chats — non-English messages are translated to English, and your English messages will send in the target language

This is not a complete product, but covers the big gotchas involved in creating an app like this

## Running the application
```
pnpm install
pnpm prisma migrate dev
pnpm run dev
```
