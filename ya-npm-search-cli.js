#!/usr/bin/env node

var util = require('util')
var querystring = require('querystring')
var nopt = require('nopt')
var request = require('request')

var opt = nopt({
    url: String,
    json: Boolean,
    sort: ['depended', 'starred', 'recent', 'score'],
    from: Number,
    debug: Boolean
}, {
    u: ['--url'],
    j: ['--json'],
    s: ['--sort'],
    f: ['--from'],
    d: ['--debug']
}, process.argv, 2)

var u = opt.url || process.env.YA_NPM_SEARCH_URL ||
    'http://ya-npm-search.herokuapp.com'
if (opt.argv.remain.length > 0) {
    var reqOpt = {
        query: opt.argv.remain.join(' '),
        format: 'json'
    }
    if (opt.sort) {
        reqOpt.sort = opt.sort
    }
    if (opt.from) {
        reqOpt.from = opt.from
    }
    u += '/search?' + querystring.stringify(reqOpt)
    if (opt.debug) {
        util.log(JSON.stringify(['url', u]))
    }
    request({ uri: u, json: true }, function(err, res, val) {
        if (err) {
            return console.log('err', err)
        }
        if (opt.json) {
            console.log(JSON.stringify(val, null, 4))
        }
        else {
            console.log('total: ' +  val.total + '\n')
            val.results.forEach(function(i) {
                var mn = i.maintainers && i.maintainers[0] && i.maintainers[0].name
                console.log(i.name + (mn ? ' / ' + mn : ''))
                console.log(' depended: ' + (i.depended || 0) +
                            ', starred: ' + (i.starred || 0) +
                            (i.keywords ? ', keywords: ' + i.keywords : ''))
                console.log(' ' + i.description)
                if (i.github) {
                    console.log(' ' + i.github.url)
                }
                console.log()
            })
            if (val.next) {
                var rest = val.total - (opt.from || 0) - 20
                console.log('and ' + String(rest) + ' packages ...   (use -f option) ')
            }
        }
    })
}
else {
    console.log('Usage: ya-npm-search [options] keyword')
    console.log('  -s, --sort  depended or starred or recent or score \n\
  -f, --from  set start number\n\
  -j, --json  print json format\
    ')
}
