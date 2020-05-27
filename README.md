# whatsapp-message-stats
Statistics preparer of whatsapp messages

### Prepared Statistics
- Total messages and days
- Number of messages and used words by user
- Number of messages per day
- Number of messages per hour of day
- Top used 30 words of each user

## Usage
### Export data from Whatsapp
```
Settings -> Chats -> Chat History -> Export Chat -> Choose Chat -> Without Media.
```

### Get downloaded data
```
node index.js -f "<filename>" --user1="<user1_name>" --user2="<user2_name>"
# names must match the names in the downloaded file
```
### Your statistics are ready as statistics.json. 
#### You can easily visualize if you want
---
You can edit config.js for the messages and words you want to omit 


