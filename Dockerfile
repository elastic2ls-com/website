FROM jekyll/jekyll

ENV JEKYLL_ENV=production

COPY --chown=jekyll:jekyll Gemfile .
COPY --chown=jekyll:jekyll Gemfile.lock .

RUN mkdir -p /srv/jekyll && chmod -R 777 /srv/jekyll

RUN bundle install --quiet --clean
RUN jekyll build

CMD ["jekyll", "serve"]
