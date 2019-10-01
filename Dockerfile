FROM jekyll/jekyll

ENV JEKYLL_ENV=production

COPY --chown=jekyll:jekyll Gemfile .
COPY --chown=jekyll:jekyll Gemfile.lock .

RUN useradd jenkins -G jekyll
RUN bundle install --quiet --clean
RUN jekyll build

CMD ["jekyll", "serve"]
