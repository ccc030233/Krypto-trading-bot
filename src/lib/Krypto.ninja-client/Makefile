ERR        = *** Unexpected MAKELEVEL = 0.
HINT       = This Makefile can't be used directly, consider cd ../../.. before try again
$(if $(subst 0,,${MAKELEVEL}),,$(warning $(ERR));$(error $(HINT)))
ERR        = *** Unexpected MAKE_VERSION < 4.
HINT       = This Makefile can't be used with your make v${MAKE_VERSION}, consider to upgrade before try again
$(if $(shell ver=${MAKE_VERSION} && test $${ver%%.*} -lt 4 && echo 1),$(warning $(ERR));$(error $(HINT)))

KASSETS    = $(KHOME)/client/www
NODE_PATH  = $(KHOME)/node_modules
PATH      := $(NODE_PATH)/.bin:$(PATH)

TSC       := tsc --baseUrl $(NODE_PATH) --typeRoots $(NODE_PATH)/@types \
               --alwaysStrict --experimentalDecorators --target ES2018 --module commonjs
BROWSERIFY:= browserify --transform [ $(NODE_PATH)/babelify --presets [ $(NODE_PATH)/@babel/preset-env ] ]
SASS      := sass --no-source-map --style compressed

TPUT       = $(if $(shell echo $${TERM}),$(shell tput $(1)))
STEPS     := $(shell grep "call\ STEP" Makefile | wc -l)
STEP       = $(call TPUT,setaf 2)$(call TPUT,setab 0)[$(1)/$(STEPS)]$(call TPUT,setaf 3)$(call TPUT,setab 0) Building client $(2)..$(call TPUT,sgr0)
STEP_1    := $(call STEP,1,npm packages)
STEP_2    := $(call STEP,2,ts files)
STEP_3    := $(call STEP,3,js zip file)
STEP_4    := $(call STEP,4,css files)

all $(KSRC): js css

npm: package.json
	$(info $(STEP_1))
	@cd $(KHOME) && $@ install
ifndef GITHUB_ACTIONS
	@rm $(KHOME)/$(basename $<)*
endif

lib: www/js npm
	$(info $(STEP_2))
	cp -R $< $(NODE_PATH)/$@
	ls -1 $< | cut -d . -f1 | xargs -I % echo "export * as % from './%';" > $(NODE_PATH)/$@/K.ts
	$(TSC) $(NODE_PATH)/$@/*.ts

$(KCLIENT)/.main.ts: $(KCLIENT)
	@echo "import 'zone.js';"                                                     > $@
	@echo "import {Shared} from 'lib/K';"                                        >> $@
	@ls -1 $< | cut -d . -f1 | xargs -I % echo "import {%Component} from './%';" >> $@
	@echo "Shared.bootstrapModule(["                                             >> $@
	@ls -1 $< | cut -d . -f1 | xargs -I % echo "%Component,"                     >> $@
	@echo "]);"                                                                  >> $@

js: $(KCLIENT)/.main.ts lib
	$(TSC) --outDir $(KASSETS)/$@ $<
	@rm -v $<
	$(info $(STEP_3))
	$(BROWSERIFY) $(KASSETS)/$@/$(notdir $(basename $<)).$@ | uglifyjs | gzip > $(KASSETS)/$@/client.min.$@

css: www/css beacons
	$(info $(STEP_4))
	$(foreach x,$(wildcard $</*.scss),$(SASS) $(realpath $(x)):$(KASSETS)/$@/$(notdir $(basename $(x))).min.$@;)
	cp -R $(NODE_PATH)/beacons $(KASSETS)/font
	cat $(NODE_PATH)/@ag-grid-community/all-modules/dist/styles/ag-grid.$@ $(NODE_PATH)/@ag-grid-community/all-modules/dist/styles/ag-theme-bootstrap.min.$@ $(KASSETS)/font/beacons.$@ >> $(KASSETS)/$@/bootstrap.min.$@
	cat $(NODE_PATH)/@ag-grid-community/all-modules/dist/styles/ag-theme-dark.min.$@  >> $(KASSETS)/$@/bootstrap-dark.min.$@
	cat $(NODE_PATH)/@ag-grid-community/all-modules/dist/styles/ag-theme-fresh.min.$@ >> $(KASSETS)/$@/bootstrap-light.min.$@

beacons:
	@test -d $(NODE_PATH)/$@ || (mkdir -p $(NODE_PATH)/$@ &&                  \
	curl -sL https://raw.githubusercontent.com/ctubio/$@/master/dist/$@.css   \
	| tail -n +7 > $(NODE_PATH)/$@/$@.css &&                                  \
	curl -sL https://raw.githubusercontent.com/ctubio/$@/master/dist/$@.woff2 \
	-o $(NODE_PATH)/$@/$@.woff2                                               )

export define PACKAGE_JSON
{
  "dependencies": {
    "@ag-grid-community/all-modules": "^26.1.0",
    "@ag-grid-community/angular":     "^26.1.0",
    "@angular/common":                   "^12.2.8",
    "@angular/compiler":                 "^12.2.8",
    "@angular/core":                     "^12.2.8",
    "@angular/forms":                    "^12.2.8",
    "@angular/platform-browser":         "^12.2.8",
    "@angular/platform-browser-dynamic": "^12.2.8",
    "@angular/router":                   "^12.2.8",
    "@babel/core":       "^7.15.0",
    "@babel/preset-env": "^7.15.0",
    "@types/node": "^16.10.2",
    "babelify": "^10.0.0",
    "browserify": "^17.0.0",
    "highcharts": "^9.2.2",
    "highcharts-angular": "^2.10.0",
    "rxjs": "^7.3.1",
    "sass": "^1.42.1",
    "typescript": "^4.4.3",
    "uglify-js": "^3.14.2",
    "zone.js": "^0.11.4"
  },
  "description": "K",
  "homepage": "https://github.com/ctubio/Krypto-trading-bot",
  "bugs": "https://github.com/ctubio/Krypto-trading-bot/issues",
  "repository": {
    "type": "git",
    "url": "git@github.com:ctubio/Krypto-trading-bot.git"
  },
  "author": "Carles Tubio",
  "os": [
    "darwin",
    "linux",
    "win32"
  ],
  "license": "MIT"
}
endef

package.json:
	@echo "$$PACKAGE_JSON" > $(KHOME)/$@

.PHONY: all $(KSRC) $(KCLIENT)/.main.ts lib css js npm beacons package.json
