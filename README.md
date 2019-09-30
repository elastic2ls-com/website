# elastic2ls_website


## Local development using Docker

elastic2ls Jekyll is meant to be so simple to use that you can do it all within the browser. However, if you'd like to develop locally on your own machine, that's possible too if you're comfortable with command line. Follow these simple steps set that up with Docker:

1. Make sure you have Docker installed.

1. Clone your repository locally.

```bash
git clone https://github.com/<your_username>/<your_username>.github.io.git
```

1. Run the following shell commands to build the docker image and start the container for the first time:

```bash
cd <repository_folder>
docker build -t elastic2ls-jekyll "$PWD"
docker run -d -p 4000:4000 --name elastic2ls-jekyll -v "$PWD":/srv/jekyll elastic2ls-jekyll
```

Now that Docker is set up, you do not need to run the above steps again. You can now view your website at http://localhost:4000/. You can start the container again in the future with:

```bash
docker start elastic2ls-jekyll
```
And you can stop the server with:

```bash
docker stop elastic2ls-jekyll
```
Whenever you make any changes to _config.yml, you must stop and re-start the server for the new config settings to take effect.
