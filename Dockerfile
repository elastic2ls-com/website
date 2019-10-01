FROM jekyll/jekyll

ENV JEKYLL_ENV=production


COPY --chown=jekyll:jekyll Gemfile .
COPY --chown=jekyll:jekyll Gemfile.lock .

RUN chown -R jekyll:jekyll /srv/jekyll

RUN bundle install --quiet --clean
RUN jekyll build

CMD ["jekyll", "serve"]
