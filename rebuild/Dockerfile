FROM jekyll/jekyll

ENV JEKYLL_ENV=production

COPY --chown=jekyll:jekyll Gemfile .
COPY --chown=jekyll:jekyll Gemfile.lock .

RUN bundle install --quiet
RUN JEKYLL_ENV=production jekyll build

CMD ["jekyll", "serve"]
