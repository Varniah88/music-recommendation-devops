# Welcome to JukeBox backend

Hi there, this is guide to how to successfully run the backend of the JukeBox application. After cloning the application open the `jukebox-backend` directory.

  
## Create files

Before starting the application you need to create `.env` file and config the relevant details,
- PORT
- MONGO_URL
- JWT_SECRET
- FRONTEND_URL
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET

## Spotify Configs

To config the `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` you need to create a Spotify account with [Spotify API](https://developer.spotify.com/).

After creating the account you need to go the `Dashboard` and select `Create app`. Then provide below details to create the application,

- App name : `JukeBox`
- App description : `This application is for a music recommendation service`
- Redirect URIs : `https://localhost:{PORT}`
- Which API/SDKs are you planning to use? : `Web API`

## MongoDB Configs
To config the `MONGO_URL` you need to create a MongoDB atlas account with [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

After creating the account you need to create a new project called `JukeBox`. Then you need to connect the application with the relevant driver which is like like,
`mongodb+srv://<db_username>:<db_password>@jukeboxdb.v158hmf.mongodb.net/JUKEBOXDB?retryWrites=true&w=majority&appName=JukeBoxDB`

As for the best practice create a database user for this cluster and use those created credentials for the `db_username` and `db_password`.

