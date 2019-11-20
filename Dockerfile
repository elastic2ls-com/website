FROM jekyll/jekyll

ENV JEKYLL_ENV=production

COPY --chown=jekyll:jekyll Gemfile .
COPY --chown=jekyll:jekyll Gemfile.lock .
COPY --chown=jekyll:jekyll _site .

RUN bundle install --quiet --clean
RUN JEKYLL_ENV=production jekyll build

CMD ["jekyll", "serve"]
