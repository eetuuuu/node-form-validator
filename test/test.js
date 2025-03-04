var assert = require("assert");
describe('req-validator', function () {
  var filter = require('../index');
  var req = {
    data: {
      'a': 100,
      'b': 200,
      'c': 300
    },
    param: function (k) {
      return this.data[k];
    }
  };

  var params = ['a', 'b', {name: 'c', alias: 'd'}];

  var data = {};

  describe('#extract()', function () {
    it('should return false when the req is not present', function () {
      assert.equal(false, filter.extract(null, data, params));
    });

    it('should return false when the data is not present', function () {
      assert.equal(false, filter.extract(req, null, params));
    });

    it('should return false when the params is not present', function () {
      assert.equal(false, filter.extract(req, data, null));
    });

    it('should return true when all the params are present', function () {
      assert.equal(true, filter.extract(req, data, params));
    });

    it('should be assigned after ', function () {
      assert.equal(100, data.a);
      assert.equal(200, data.b);
      assert.equal(300, data.d);
      assert.equal(3, filter.count(data));
    });
  });

  describe('#validate()', function () {
    it('should enabled validate string with length limite', function () {
      var params = {
        k1: 'hell'
      };
      var confs = {
        k1: {
          type: 'string',
          minLength: 5
        }
      };
      var params2 = {
        k2: 'hell'
      };
      var confs2 = {
        k2: {
          type: 'string',
          maxLength: 3
        }
      };
      var error = {};

      var params3 = {
        k3: 'hell'
      };
      var confs3 = {
        k3: {
          type: 'string',
          maxLength: 4,
          minLength: 1
        }
      };
      assert.equal(false, filter.validate(params, confs, error));
      assert.equal(false, filter.validate(params, confs));
      assert.equal(true, params[error.key] === params.k1);
      assert.equal(true, 'Not validate key k1' === error.reason);

      assert.equal(false, filter.validate(params2, confs2, error));
      assert.equal(true, params2[error.key] === params2.k2);
      assert.equal(true, 'Not validate key k2' === error.reason);

      assert.equal(true, filter.validate(params3, confs3, error));
      assert.equal(false, error.key === 'k3');
      assert.equal(false, 'Not validate key k3' === error.reason);

    });


    it('should validate mobile phone numbers', function () {
      var params = {
        k1: '13581723443'
      };
      var confs = {
        k1: {
          type: 'phone',
          locale: 'zh-CN'
        }
      };
      var error = {};

      assert.equal(true, filter.validate(params, confs, error));
      assert.equal(false, error.key === 'k1');
      assert.equal(false, 'Not validate key k1' === error.reason);

      var params2 = {
        k2: 'aaaa'
      };
      var confs2 = {
        k2: {
          type: 'phone',
          locale: 'zh-CN'
        }
      };
      assert.equal(false, filter.validate(params2, confs2, error));
      assert.equal(true, error.key === 'k2');
      assert.equal(true, 'Not validate key k2' === error.reason);
    });


    it('should validate matches', function () {
      var params = {
        k1: '13581723443',
        k2: '13581723443'
      };
      var confs = {
        k2: {
          matches: 'k1'
        }

      };
      var error = {};

      assert.equal(true, filter.validate(params, confs, error));
      assert.equal(false, error.key === 'k1' || error.key === 'k2');
      assert.equal(false, 'Not validate key k1' === error.reason);
      assert.equal(false, 'Not validate key k2' === error.reason);


      var params2 = {
        k1: '13581723443',
        k2: 'aaaa'
      };
      var confs2 = {
        k2: {
          matches: 'k1'
        }
      };
      assert.equal(false, filter.validate(params2, confs2, error));
      assert.equal(true, error.key === 'k2');
      assert.equal(false, null === error.reason);
    });


    it('should validate required', function () {
      var params = {
        k1: '13581723443'
      };
      var confs = {
        k1: {
          required: true
        }
      };
      var error = {};

      assert.equal(true, filter.validate(params, confs, error));
      assert.equal(false, error.key === 'k1');
      assert.equal(false, 'Not validate key k1' === error.reason);

      params.k1 = null;
      assert.equal(false, filter.validate(params, confs, error));
      assert.equal(true, error.key === 'k1');
      assert.equal(true, 'Key ' + error.key + " is NULL" === error.reason);
    });


    it('should validate many params together', function () {
      var params = {
        k1: '13581723443',
        k2: 'hello',
        k3: 'http://www.foobar.com/'
      };
      var confs = {
        k1: {

          type: 'phone',
          locale: 'zh-CN'

        },
        k2: {
          type: 'string',
          minLength: 3,
          maxLength: 5
        },
        k3: {
          type: 'url'
        }
      };
      var error = {};

      assert.equal(true, filter.validate(params, confs, error));
      assert.equal(false, error.key === 'k1');
      assert.equal(false, 'Not validate key k1' === error.reason);
    });


    it('should validate matches', function () {
      var params = {
        k1: '13581723443',
        k2: 'hello',
        k3: 'http://www.foobar.com/'
      };
      var confs = {
        k1: {

          type: 'phone',
          locale: 'zh-CN'

        },
        k2: {
          matches: 'k1'
        },
        k3: {
          type: 'url'
        }
      };
      var error = {};

      assert.equal(false, filter.validate(params, confs, error));
      assert.equal(true, error.key === 'k2');
      assert.equal(true, 'Not match key k1' === error.reason);
    });

    it('should not validate arrays', function () {
      var params = ['aa', 'ddd', 'ddd'];
      var confs = {
        k1: {

          type: 'phone',
          locale: 'zh-CN'

        },
        k2: {
          matches: 'k1'
        },
        k3: {
          type: 'url'
        }
      };
      var error = {};
      var result = filter.validate(params, confs, error);

      assert.equal(false, result);
      assert.equal(true, 'Params must not be an Array!' === error.reason);
    });

  });

  it('should not validate integer as string', function() {
    var params = {
      k1: 1
    };
    var confs = {
      k1: {

        type: 'string',
        required: true
      }
    };
    var error = {};

    assert.equal(false, filter.validate(params, confs, error));
  });

  it('should validate string', function() {
    var params = {
      k1: '1'
    };
    var confs = {
      k1: {

        type: 'string',
        required: true
      }
    };
    var error = {};

    assert.equal(true, filter.validate(params, confs, error));
  });

  describe('#result()', function () {
    it('should validate', function () {
      var req1 = {
        data: {
          'k1': '13181715210',
          'k2': '13181715210',
          'k3': 'http://www.sina.com',
          'k5': '10:00',
          'k6': '24:00',
          'k7': '00:19',
          'k8': '19:59',
          'k9': '24:00:00',
          'k10': '23:59:59',
          'k11': '1:19',
          'k12': '1:00'

        },
        param: function (k) {
          return this.data[k];
        }
      };
      var confs = {
        k1: {
          alias: 'phone',
          type: 'phone',
          locale: 'zh-CN'

        },
        k2: {
          matches: 'k1'
        },
        k3: {
          type: 'url'
        },
        k4: {
          ignore: true
        },
        k5: {
          type: 'time'
        },
        k6: {
          type: 'time'
        },
        k7: {
          type: 'time'
        },
        k8: {
          type: 'time'
        },
        k9: {
          type: 'time'
        },
        k10: {
          type: 'time'
        }
      };
      var validator = filter;
      var data = {}, error = {};
      var result = validator.v(req1, confs, data, error);
      assert.equal(true, result);
      assert.equal(true, data.phone === '13181715210');
      assert.equal(true, data.k3 === 'http://www.sina.com');
      assert.equal(true, !!data.k2);
      assert.equal(true, data.k4 === undefined);
      assert.equal(true, data.k5 === '10:00');
    });

    it('should extra json', function () {
      var req1 = {
        'k1': '13181715210',
        'k2': '13181715210',
        'k3': 'http://www.sina.com',
        'k5': '10:00',
        'k6': '24:00',
        'k7': '00:19',
        'k8': '19:59',
        'k9': '24:00:00',
        'k10': '23:59:59',
        'k11': '1:19',
        'k12': '1:00'
      };
      var confs = {
        k1: {
          alias: 'phone',
          type: 'phone',
          locale: 'zh-CN'
        },
        k2: {
          matches: 'k1'
        },
        k3: {
          type: 'url'
        },
        k4: {
          type: 'time'
        }
      };
      var validator = filter.json;
      var data = validator.extract(req1, confs);
      assert.equal(true, data.phone === '13181715210');
      assert.equal(true, data.k3 === 'http://www.sina.com');
      assert.equal(true, !!data.k2);
      assert.equal(true, data.k4 === undefined);
      assert.equal(true, data.k5 === undefined);
    });

    it('should validate objects', function () {
      var req1 = {
        'k1': {
          kk1: 'hello',
          kk2: {
            kk3: 1,
            kk4: {
              kk5: 'http://www.sina.com',
              kk6: '13581725228'
            }
          }
        },
        'k12': '1:00'
      };
      var confs = {
        k1: {
          type: 'object',
          validate: {
            kk1: {
              type: 'string'
            },
            kk2: {
              type: 'object',
              validate: {
                kk3: {
                  type: 'number'
                },
                kk4: {
                  type: 'object',
                  validate: {
                    kk5: {
                      type: 'url',
                      required: true
                    },
                    kk6: {
                      type: 'phone',
                      alias: 'phone',
                      locale: 'zh-CN'
                    }
                  }
                }
              }
            }
          }
        },

        k12: {
          type: 'time'
        }
      };
      var validator = filter.json;
      var data = validator.extract(req1, confs);
      assert.deepEqual(data, req1);
    });
  });
});


