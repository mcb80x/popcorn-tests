.PHONY: svg dir css js serve


all: html js svg css

css:
	mkdir -p www/css
	cp -r css/* www/css/
	cp -r common/css/* www/css/

html:
	jade --out www/ .

dir:
	mkdir -p www/js

js: ${COFFEE_FILES} dir
	toaster -d -c

svg:
	mkdir -p www/svg
	cp art/*.* www/svg/

serve: all
	cd www; python -m SimpleHTTPServer 8080
