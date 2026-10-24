/* Dữ liệu mẫu (giả lập). Toàn bộ nội dung là dữ liệu minh họa, không phải thông tin thực tế.
   Mật khẩu mọi tài khoản mẫu: CultureTrail1 */
(function(){
  const CT = window.CT = window.CT || {};
  const ago = m => new Date(Date.now() - m * 60000).toISOString();
  const day = d => new Date(Date.now() - d * 86400000).toISOString();
  const P = 'CultureTrail1';
  const prefs = () => ({ review:true, events:true, weekly:true, publicProfile:false });

  const users = [
    {id:'u1',name:'Nguyễn Thu Hà',email:'ha.nguyen@example.com',password:P,roles:['creator'],status:'active',city:'Hà Nội',bio:'Tôi tìm cảm hứng từ những câu chuyện của làng nghề Việt Nam.',joined:'2026-09-01',saved:['s1','s2'],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u2',name:'Mai Phương',email:'phuong@example.com',password:P,roles:['curator'],status:'active',city:'Hà Nội',bio:'Biên tập viên văn hóa.',joined:'2026-08-12',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u3',name:'Trần Minh An',email:'an@example.com',password:P,roles:['creator'],status:'active',city:'Hội An',bio:'Kể chuyện về đèn lồng và phố cổ.',joined:'2026-08-20',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u4',name:'Lê Ngọc Linh',email:'linh@example.com',password:P,roles:['creator'],status:'disabled',disabledReason:'Theo yêu cầu tạm ngưng của chủ tài khoản.',city:'Huế',bio:'',joined:'2026-08-25',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u5',name:'Vũ Hoàng Nam',email:'nam@example.com',password:P,roles:['admin'],status:'active',city:'Hà Nội',bio:'',joined:'2026-07-01',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u6',name:'Phạm Văn Lộc',email:'loc@example.com',password:P,roles:['creator'],status:'active',city:'Hà Nội',bio:'Người con của làng tre Phú Vinh.',joined:'2026-09-05',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u7',name:'Phạm Thanh Bình',email:'binh@example.com',password:P,roles:['creator'],status:'active',city:'Hà Nội',bio:'',joined:'2026-09-06',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u8',name:'Đỗ Quang Huy',email:'huy@example.com',password:P,roles:[],status:'active',city:'Huế',bio:'',joined:'2026-09-10',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u9',name:'Ngô Bích Ngọc',email:'ngoc@example.com',password:P,roles:[],status:'active',city:'Hội An',bio:'',joined:'2026-09-11',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u10',name:'Hoàng Anh Tú',email:'tu@example.com',password:P,roles:[],status:'active',city:'Hà Nội',bio:'',joined:'2026-09-14',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u11',name:'Bùi Gia Hân',email:'han@example.com',password:P,roles:[],status:'active',city:'Hà Nội',bio:'',joined:'2026-09-18',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true},
    {id:'u12',name:'Đặng Minh Khôi',email:'khoi@example.com',password:P,roles:[],status:'active',city:'Huế',bio:'',joined:'2026-09-21',saved:[],savedEvents:[],prefs:prefs(),summaries:{},emailVerified:true}
  ];

  const creators = [
    {id:'u1',name:'Nguyễn Thu Hà',field:'Nghề gốm',placeId:'p-bat-trang',bio:'Tôi lớn lên bên bàn xoay của gia đình. Tôi kể về những ngày sống cùng đất và mở xưởng để mọi người hiểu hơn về nghề gốm.',publicEmail:'thuha.workshop@example.com',website:'https://example.com/thuha',showEmail:true,portrait:null,gallery:[
      {id:'g1',caption:'Bình men trầm · Danh mục tác phẩm · 2026',src:null},{id:'g2',caption:'Bộ cốc đất mộc · Danh mục tác phẩm · 2026',src:null},{id:'g3',caption:'Đĩa họa tiết lá · Danh mục tác phẩm · 2026',src:null}]},
    {id:'u3',name:'Trần Minh An',field:'Đèn lồng',placeId:'p-hoi-an',bio:'Nghệ nhân đèn lồng Hội An.',publicEmail:'',website:'',showEmail:false,portrait:null,gallery:[]},
    {id:'u4',name:'Lê Ngọc Linh',field:'Di sản',placeId:'p-hue',bio:'',publicEmail:'',website:'',showEmail:false,portrait:null,gallery:[]},
    {id:'u6',name:'Phạm Văn Lộc',field:'Tre trúc',placeId:'p-phu-vinh',bio:'',publicEmail:'',website:'',showEmail:false,portrait:null,gallery:[]},
    {id:'u7',name:'Phạm Thanh Bình',field:'Nghề gốm',placeId:'p-bat-trang',bio:'',publicEmail:'',website:'',showEmail:false,portrait:null,gallery:[]}
  ];

  // x,y: vị trí trên sơ đồ minh họa (0–100), KHÔNG phải tọa độ thực
  const places = [
    {id:'p-bat-trang',name:'Làng gốm Bát Tràng',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Làng nghề',topic:'craft',img:'lane',x:62,y:30,
      lead:'Gặp người làm gốm và dành một buổi sáng chậm rãi trong làng.',title2:'Một ngôi làng sống cùng nghề',
      desc:['Những xưởng nhỏ, cửa hàng gốm và khoảng sân phơi sản phẩm tạo nên nhịp sống riêng của Bát Tràng. Với CultureTrail, bạn khám phá nơi này qua lời kể của người làm nghề thay vì chỉ một danh sách điểm đến.','Ghé xưởng Thu Hà để hiểu quá trình tạo hình; tìm đọc câu chuyện về men và cách người thợ quan sát từng mẻ nung. Hãy hỏi trước khi chụp ảnh, tôn trọng không gian làm việc và xác nhận lịch mở cửa với cơ sở.'],
      hours:'08:30 – 17:00',duration:'2 – 3 giờ',fee:'Liên hệ xưởng',contact:'0900 000 026'},
    {id:'p-cong-lang',name:'Cổng làng Bát Tràng',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Điểm dừng',topic:'craft',parentId:'p-bat-trang',img:'lane',x:30,y:24,note:'Tìm hiểu không gian làng',mins:30,lead:'Điểm bắt đầu của buổi sáng trong làng.'},
    {id:'p-xuong-thu-ha',name:'Xưởng gốm Thu Hà',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Điểm dừng',topic:'craft',parentId:'p-bat-trang',img:'clay',x:48,y:70,note:'Gặp người kể chuyện & thử tạo hình',mins:90,lead:'Xưởng nhỏ của nghệ nhân Thu Hà.'},
    {id:'p-trung-bay',name:'Không gian trưng bày gốm',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Điểm dừng',topic:'craft',parentId:'p-bat-trang',img:'clay',x:78,y:46,note:'Xem sản phẩm & ghi lại cảm nhận',mins:30,lead:'Nơi trưng bày các sản phẩm tiêu biểu.'},
    {id:'p-phu-vinh',name:'Làng nghề Phú Vinh',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Làng nghề',topic:'craft',img:'lane',x:24,y:62,lead:'Làng tre trúc nhiều thế hệ.',title2:'Làng của những đôi tay đan',desc:['Phú Vinh nổi tiếng với nghề mây tre đan. Mỗi gia đình giữ một góc nghề riêng.'],hours:'08:00 – 17:00',duration:'2 giờ',fee:'Liên hệ hộ làm nghề',contact:'0900 000 031'},
    {id:'p-phu-vinh-xuong',name:'Nhà đan tre Phú Vinh',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Điểm dừng',topic:'craft',parentId:'p-phu-vinh',img:'lane',x:40,y:50,note:'Xem người thợ đan tre',mins:60,lead:'Một hộ làm nghề đan tre.'},
    {id:'p-pho-co',name:'Không gian phố cổ',city:'Hà Nội',province:'Hà Nội',region:'Miền Bắc',kind:'Khu phố',topic:'heritage',img:'lane',x:46,y:44,lead:'Những con phố nghề của Hà Nội.',title2:'Phố nghề trong lòng thành phố',desc:['Các phố nghề cổ vẫn giữ nhịp sống thủ công.'],hours:'Cả ngày',duration:'2 giờ',fee:'Miễn phí',contact:'—'},
    {id:'p-hoi-an',name:'Phố cổ Hội An',city:'Hội An',province:'Quảng Nam',region:'Miền Trung',kind:'Khu phố',topic:'craft',img:'lantern',x:70,y:62,lead:'Ánh đèn lồng và những xưởng nhỏ.',title2:'Phố của ánh đèn',desc:['Đèn lồng Hội An gắn với nhịp sống của người dân suốt nhiều mùa trăng.'],hours:'09:00 – 21:00',duration:'3 giờ',fee:'Liên hệ cơ sở',contact:'0900 000 052'},
    {id:'p-hoian-den',name:'Xưởng đèn lồng Minh An',city:'Hội An',province:'Quảng Nam',region:'Miền Trung',kind:'Điểm dừng',topic:'craft',parentId:'p-hoi-an',img:'lantern',x:30,y:30,note:'Xem làm đèn lồng',mins:60,lead:'Xưởng nhỏ làm đèn lồng.'},
    {id:'p-hoian-pho',name:'Phố đèn lồng về đêm',city:'Hội An',province:'Quảng Nam',region:'Miền Trung',kind:'Điểm dừng',topic:'craft',parentId:'p-hoi-an',img:'lantern',x:60,y:55,note:'Đi dạo & ghi lại cảm nhận',mins:45,lead:'Dãy phố treo đèn.'},
    {id:'p-hoian-tre',name:'Nhà nghệ nhân đan tre',city:'Hội An',province:'Quảng Nam',region:'Miền Trung',kind:'Điểm dừng',topic:'craft',parentId:'p-hoi-an',img:'lantern',x:80,y:35,note:'Gặp nghệ nhân đan tre',mins:60,lead:'Một nhà nghệ nhân.'},
    {id:'p-hue',name:'Nhà vườn Huế',city:'Huế',province:'Thừa Thiên Huế',region:'Miền Trung',kind:'Di sản',topic:'heritage',img:'heritage',x:50,y:78,lead:'Những hiên nhà vườn yên tĩnh.',title2:'Hiên nhà giữa vườn',desc:['Nhà vườn Huế giữ nhịp sống chậm giữa cây xanh và mái ngói rêu.'],hours:'08:00 – 17:00',duration:'2 giờ',fee:'Liên hệ chủ nhà',contact:'0900 000 073'},
    {id:'p-hue-noi',name:'Hiên nhà vườn An Hội',city:'Huế',province:'Thừa Thiên Huế',region:'Miền Trung',kind:'Điểm dừng',topic:'heritage',parentId:'p-hue',img:'heritage',x:35,y:40,note:'Ngắm kiến trúc nhà vườn',mins:60,lead:'Một nhà vườn nhỏ.'},
    {id:'p-hue-cho',name:'Chợ sớm Huế',city:'Huế',province:'Thừa Thiên Huế',region:'Miền Trung',kind:'Điểm dừng',topic:'food',parentId:'p-hue',img:'heritage',x:70,y:55,note:'Dạo chợ buổi sớm',mins:45,lead:'Chợ sớm của người dân.'}
  ];

  const T = (id,name,parentId,status,desc,syn) => ({id,name,parentId,status:status||'active',desc:desc||'',synonyms:syn||''});
  const tags = [
    T('cat-craft','Nghề thủ công',null), T('cat-heritage','Di sản & kiến trúc',null), T('cat-food','Ẩm thực',null), T('cat-fest','Lễ hội',null), T('cat-local','Địa phương',null),
    T('t-gom','Nghề gốm','cat-craft','active','Câu chuyện về người làm gốm, quá trình chế tác và trải nghiệm tại xưởng.','Gốm, làm gốm, nghệ nhân gốm'),
    T('t-danlat','Đan lát','cat-craft','active','Nghề đan tre, mây, cói.','Đan tre, mây tre'),
    T('t-det','Dệt & lụa','cat-craft'), T('t-denlong','Làm đèn lồng','cat-craft','active','Nghề làm đèn lồng.','Đèn lồng'),
    T('t-gomtt','Gốm truyền thống','cat-craft','review','','Gốm cổ'), T('t-traingh','Trải nghiệm','cat-craft','review','Hoạt động trải nghiệm tại xưởng.',''),
    T('t-nhavuon','Nhà vườn','cat-heritage'), T('t-kientruc','Kiến trúc cổ','cat-heritage'),
    T('t-bunbo','Món ăn đường phố','cat-food'), T('t-banh','Bánh truyền thống','cat-food'),
    T('t-trungthu','Đêm rằm','cat-fest'), T('t-lehoi','Lễ hội làng','cat-fest'),
    T('t-hn-bt','Hà Nội / Bát Tràng','cat-local'), T('t-hoian','Hội An','cat-local'), T('t-hue','Huế','cat-local'),
    T('t-old1','Gốm cũ','cat-craft','archived'), T('t-old2','Thủ công mỹ nghệ','cat-craft','archived'), T('t-old3','Làng cổ','cat-local','archived')
  ];

  const sec = (h,...p) => ({h,p});
  const S = (o) => Object.assign({status:'approved',live:true,version:1,feedback:[],history:[],tags:[],imageSource:'Ảnh minh họa thiết kế',submittedAt:null,assignee:null,note:'',placeHint:''}, o);
  const stories = [
    S({id:'s1',title:'Bàn tay giữ hồn đất',lead:'Ở một xưởng nhỏ tại Bát Tràng, Nguyễn Thu Hà kể về ký ức, sự kiên nhẫn và những thế hệ sống cùng đất.',creatorId:'u1',placeId:'p-bat-trang',topic:'craft',readMin:8,updatedAt:day(1),submittedAt:day(2),tags:['t-gom','t-hn-bt'],img:'clay',
      sections:[sec('Khi đất gặp bàn tay','Buổi sáng ở xưởng gốm Thu Hà bắt đầu bằng tiếng nước và nhịp quay đều của bàn xoay. Chị đặt một khối đất đã nhào kỹ vào giữa, làm ướt tay rồi từ từ nâng thành chiếc bình. “Phải cảm được đất đang muốn đi đâu”, chị nói, mắt vẫn nhìn theo chuyển động của đôi tay.'),
      sec('Một nghề được học từ những điều nhỏ','Thu Hà nhớ những ngày đứng bên mẹ, chỉ làm những việc giản dị: nhặt vụn đất, lau bàn, xếp sản phẩm chưa nung lên giá. Khi được thử tạo hình, chiếc bát đầu tiên nghiêng về một phía. Mẹ không sửa hộ; bà chỉ nhắc chị chậm lại và lắng nghe nhịp xoay.','Trong câu chuyện của chị, kinh nghiệm không nằm ở một công thức duy nhất. Độ ẩm, thời tiết và thói quen của bàn tay đều khiến mỗi ngày ở xưởng có chút khác nhau. Người thợ quan sát, điều chỉnh và thử lại.'),
      sec('Giữ nghề bằng cách tiếp tục làm','Trên kệ, những chiếc bình men trầm đứng cạnh các mẫu cốc nhỏ dành cho người trẻ. Thu Hà không muốn xưởng chỉ là nơi trưng bày ký ức. Chị mở những buổi trải nghiệm để khách hiểu rằng một món gốm cần nhiều công đoạn và sự kiên nhẫn.','“Người đến không nhất thiết phải làm được chiếc bát đẹp. Nếu họ hiểu thêm một chút về người làm ra nó, tôi đã vui rồi.” Câu chuyện khép lại khi chị trở về bàn xoay, tiếp tục nâng một khối đất mới.')]}),
    S({id:'s2',title:'Ánh đèn qua những mùa trăng',lead:'Một xưởng đèn lồng ở Hội An và những mùa trăng của người thợ.',creatorId:'u3',placeId:'p-hoi-an',topic:'craft',readMin:6,version:2,status:'processing',assignee:'u2',updatedAt:day(2),submittedAt:day(2),tags:['t-denlong','t-hoian'],img:'lantern',
      sections:[sec('Những khung tre đầu mùa','Trần Minh An bắt đầu mùa đèn bằng việc chọn từng thanh tre. Mỗi khung đèn là một lần tính toán bằng mắt và bàn tay.','Anh kể rằng lụa dán lên khung phải căng vừa đủ, để ánh sáng đi qua mà không làm lộ mối nối.'),sec('Ánh sáng và ký ức','Với người Hội An, ánh đèn gắn với những đêm rằm và những bữa cơm gia đình. Anh làm đèn như cách giữ lại ký ức ấy.')]}),
    S({id:'s3',title:'Một buổi sớm bên hiên Huế',lead:'Nghe tiếng mưa rơi trên mái ngói rêu của một nhà vườn Huế.',creatorId:'u4',placeId:'p-hue',topic:'heritage',readMin:7,tags:['t-nhavuon','t-hue'],img:'heritage',updatedAt:day(5),
      sections:[sec('Sương trên mái ngói','Buổi sớm ở nhà vườn bắt đầu bằng tiếng chổi quét sân. Hiên nhà mở ra khu vườn còn ướt sương.','Chủ nhà kể rằng gian hiên này được giữ nguyên qua nhiều thế hệ, chỉ thay vài viên ngói khi mùa mưa đến.'),sec('Nhịp sống chậm','Bên chén trà, người ta chậm lại và nghe câu chuyện của ngôi nhà.')]}),
    S({id:'s4',title:'Đất kể chuyện mùa thu',lead:'Mùa thu ở Bát Tràng qua lời một người thợ gốm.',creatorId:'u7',placeId:'p-bat-trang',topic:'craft',readMin:5,tags:['t-gom','t-hn-bt'],img:'clay',updatedAt:day(6),
      sections:[sec('Mùa đất khô','Mùa thu, đất phơi nhanh hơn và người thợ phải canh giờ nặn cho kịp nắng.','Anh kể rằng mỗi mùa có một cách làm việc riêng, và mùa thu là lúc xưởng đông khách nhất.')]}),
    S({id:'s5',title:'Tre đan qua từng thế hệ',lead:'Ba thế hệ trong một gia đình đan tre ở Phú Vinh.',creatorId:'u6',placeId:'p-phu-vinh',topic:'craft',readMin:5,tags:['t-danlat'],img:'lane',updatedAt:day(7),
      sections:[sec('Những nan tre mỏng','Bà ngoại chẻ nan, mẹ đan, cháu học cách vuốt cạnh. Mỗi người giữ một phần của chiếc rổ.')]}),
    S({id:'s6',title:'Sắc men từ những ngày mưa',lead:'Thu Hà ghi lại màu men qua từng buổi sáng mưa ở xưởng.',creatorId:'u1',placeId:'p-bat-trang',topic:'craft',readMin:4,status:'pending',live:false,submittedAt:'2026-10-03T08:40:00',tags:[],img:'clay',imageSource:'Ảnh minh họa thiết kế',
      history:[{at:'2026-10-03T08:40:00',text:'Thu Hà gửi phiên bản 1'}],
      sections:[sec('Những sắc men trên giá gỗ','Có những buổi sáng trời mưa, ánh sáng trong xưởng làm màu của từng chiếc bình trông khác đi. Thu Hà đặt một chiếc bát lên bàn, kể rằng chị thường ghi lại điều mình nhìn thấy sau mỗi lần thử men.','Trong ký ức của chị, người thợ không chỉ làm ra vật dụng mà còn giữ những kinh nghiệm nhỏ: cách quan sát, cách chờ đợi, cách chấp nhận một lần thử chưa như mong muốn. Những ghi chép của xưởng giúp người học nghề hiểu quá trình ấy.','Chị mở những buổi gặp gỡ để khách nhìn công việc từ gần hơn. Bài viết kể trải nghiệm cá nhân của một xưởng; không đưa ra công thức kỹ thuật hay khẳng định niên đại lịch sử.')]}),
    S({id:'s7',title:'Màu men từ sân nhà',lead:'Một câu chuyện về những sắc men trong xưởng nhỏ và cách người thợ học từ từng lần thử.',creatorId:'u1',placeId:'p-bat-trang',topic:'craft',readMin:4,status:'rejected',live:false,version:2,submittedAt:'2026-10-02T09:00:00',tags:[],img:'clay',imageSource:'',note:'Đã làm rõ cách diễn đạt về kỹ thuật. Tôi sẽ bổ sung nguồn ảnh.',
      feedback:[{at:'2026-10-03T09:30:00',by:'Mai Phương',kind:'revise',text:'Bổ sung nguồn ảnh, quyền sử dụng và làm rõ đoạn mô tả kỹ thuật nung.'}],
      history:[{at:'2026-10-02T09:00:00',text:'Thu Hà gửi phiên bản 1'},{at:'2026-10-03T09:30:00',text:'Mai Phương yêu cầu chỉnh sửa'}],
      sections:[sec('Nội dung','Trên giá gỗ ở cuối sân xưởng, những chiếc bát vừa ra lò mang nhiều sắc men khác nhau. Có chiếc ngả xanh như nước ao sau mưa, có chiếc nâu sẫm như đất ruộng vừa cày. Tôi thường ngồi cạnh mẹ vào những buổi chiều cuối thu, nhìn bà xếp từng chiếc bát lên giá và ghi lại màu của từng mẻ bằng một cây bút chì cùn trong cuốn sổ nhỏ bọc giấy báo. Với bà, mỗi mẻ men là một lần trò chuyện với lửa, và lửa chưa bao giờ trả lời giống nhau.',
        'Với tôi, màu men là kết quả của nhiều lần thử và quan sát. Cùng một công thức, nhưng hôm nắng ráo màu men lên khác, hôm trời ẩm lại khác. Mẹ dạy tôi nhìn màu của ngọn lửa qua khe cửa lò, nghe tiếng củi nổ và ngửi mùi khói để đoán lò đang nóng đến đâu. Những thông số trong bài này chỉ kể lại trải nghiệm của xưởng nhà tôi, không phải hướng dẫn kỹ thuật để người đọc tự thực hiện.',
        'Có những mẻ hỏng làm cả nhà buồn cả tuần. Men chảy xuống chân bát, màu xỉn như bùn, hoặc rạn chi chít như lòng suối cạn. Nhưng mẹ không bỏ chúng đi. Bà xếp những chiếc bát lỗi ấy ở góc sân, dùng làm chậu trồng húng, làm đĩa đựng nước cho đàn gà. Nhìn chúng, tôi hiểu nghề gốm không chỉ có những chiếc bình hoàn hảo, mà còn có cả sự kiên nhẫn chấp nhận những điều chưa được như mong muốn.',
        'Bây giờ, mỗi lần đón khách ghé xưởng, tôi vẫn dẫn họ ra góc sân ấy trước tiên. Họ hay hỏi vì sao không bán những chiếc bát đẹp nhất ở đây. Tôi cười và đáp rằng cái đẹp ở nơi này nằm trong cả quá trình, từ nắm đất ướt đến mẻ men cuối cùng. Tôi đang bổ sung phần mô tả quá trình và ghi rõ nguồn tham khảo cho từng nhận định trong bài.')]}),
    S({id:'s8',title:'Nhật ký bên lò nung',lead:'Những dòng ghi chép bên lò nung của xưởng gốm.',creatorId:'u1',placeId:null,placeHint:'Bát Tràng',topic:'craft',readMin:3,status:'draft',live:false,version:1,tags:[],img:'clay',imageSource:'',updatedAt:day(2),
      sections:[sec('Nội dung','Lò nung cuối xưởng đỏ lửa từ chiều hôm trước. Tôi ngồi ghi lại nhiệt độ bằng cảm nhận của mắt và tay, như cách mẹ vẫn làm.','Đây mới là bản nháp đầu tiên. Tôi sẽ bổ sung thêm phần kể về những người đã giúp giữ lửa suốt đêm.')]}),
    S({id:'s9',title:'Nhịp tre bên hiên nhà',lead:'Tiếng dao chẻ nan buổi sáng ở Phú Vinh.',creatorId:'u6',placeId:null,placeHint:'Phú Vinh',topic:'craft',readMin:5,status:'pending',live:false,submittedAt:'2026-10-02T16:10:00',tags:[],img:'lane',
      sections:[sec('Tiếng dao chẻ nan','Mỗi sáng, tiếng dao chẻ nan vang qua các hiên nhà trong làng. Người thợ làm việc theo nhịp quen thuộc.','Họ nói rằng nghe tiếng dao là biết hôm nay tre dẻo hay giòn.')]}),
    S({id:'s10',title:'Một nhịp chợ sớm',lead:'Chợ sớm Huế trước khi thành phố thức dậy.',creatorId:'u4',placeId:'p-hue',topic:'food',readMin:4,status:'pending',live:false,submittedAt:'2026-10-02T10:25:00',tags:[],img:'heritage',
      sections:[sec('Trước giờ mở cửa','Quầy hàng được dọn từ khi trời còn tối. Người bán và người mua chào nhau bằng những câu quen thuộc.')]}),
    S({id:'s11',title:'Nón lá nghiêng bóng phố cổ',lead:'Người thợ khâu nón giữa phố nghề.',creatorId:'u7',placeId:'p-pho-co',topic:'craft',readMin:6,tags:['t-danlat'],img:'lane',updatedAt:day(9),
      sections:[sec('Mũi kim và lá cọ','Từng mũi khâu đều đặn đưa chiếc nón thành hình. Người thợ nói nón không chỉ để che nắng mà còn là một phần của dáng người Việt.')]}),
    S({id:'s12',title:'Nhịp thoi dệt lụa',lead:'Khung dệt lụa trong một căn nhà phố cổ.',creatorId:'u6',placeId:'p-pho-co',topic:'craft',readMin:7,tags:['t-det'],img:'lantern',updatedAt:day(10),
      sections:[sec('Tiếng thoi đưa','Tiếng thoi đều đặn như nhịp thở của căn nhà. Người thợ dệt nhớ từng hoa văn qua nhiều năm làm nghề.')]}),
    S({id:'s13',title:'Mái ngói rêu trong Đại Nội',lead:'Một buổi chiều nhìn mái ngói cũ ở Huế.',creatorId:'u4',placeId:'p-hue',topic:'heritage',readMin:6,tags:['t-kientruc','t-hue'],img:'heritage',updatedAt:day(11),
      sections:[sec('Lớp rêu theo mùa','Rêu bám trên ngói như một dấu vết của thời gian. Người giữ nhà biết mỗi mùa rêu có một màu.')]}),
    S({id:'s14',title:'Hương nếp cẩm bên bếp củi',lead:'Món xôi nếp cẩm trong bếp một gia đình ở phố cổ.',creatorId:'u6',placeId:'p-pho-co',topic:'food',readMin:5,tags:['t-banh'],img:'lane',updatedAt:day(12),
      sections:[sec('Bếp củi đầu ngày','Nồi xôi được đồ từ sớm. Mùi nếp lan khắp ngõ nhỏ.')]}),
    S({id:'s15',title:'Đêm rằm phố cổ Hội An',lead:'Đêm rằm khi cả phố tắt điện để thắp đèn lồng.',creatorId:'u3',placeId:'p-hoi-an',topic:'festival',readMin:5,tags:['t-trungthu','t-hoian'],img:'lantern',updatedAt:day(13),
      sections:[sec('Ánh đèn thay điện','Người dân cùng tắt điện để phố chỉ còn ánh đèn lồng. Trẻ con thả đèn xuống sông.')]}),
    S({id:'s16',title:'Bát mì Quảng đầu mùa',lead:'Một quán mì Quảng quen thuộc buổi sáng.',creatorId:'u3',placeId:'p-hoi-an',topic:'food',readMin:4,tags:['t-bunbo','t-hoian'],img:'lantern',updatedAt:day(14),
      sections:[sec('Nước nhân đậm vị','Chủ quán dậy từ ba giờ sáng để ninh nước nhân. Bà nói vị đậm là nhờ kiên nhẫn.')]})
  ];

  const E = o => Object.assign({placeId:'p-bat-trang',location:'Xưởng gốm Thu Hà',address:'Ngõ xưởng gốm, Bát Tràng, Hà Nội · Địa chỉ mẫu',fee:'Liên hệ xưởng',contact:'thuha.workshop@example.com',creatorId:'u1',imageSource:'Ảnh minh họa thiết kế · Cần thay bằng ảnh có quyền sử dụng khi triển khai',desc:'Buổi gặp gỡ tại xưởng: quan sát nghệ nhân tạo hình, nghe câu chuyện về đất và thử làm một món gốm nhỏ. Không yêu cầu kinh nghiệm. Trẻ em cần có người lớn đi cùng.',registered:0,cancelReason:'',updatedAt:ago(600)},o);
  const events = [
    E({id:'e1',title:'Ngày trải nghiệm gốm',status:'upcoming',startDate:'2026-10-10',endDate:'2026-10-10',startTime:'09:00',endTime:'11:00',capacity:20,registered:12}),
    E({id:'e2',title:'Gặp gỡ bên bàn xoay',status:'draft',startDate:'2026-10-24',endDate:'2026-10-24',startTime:'14:00',endTime:'16:00',capacity:15,registered:0}),
    E({id:'e3',title:'Đất và những bàn tay',status:'completed',startDate:'2026-09-20',endDate:'2026-09-20',startTime:'09:00',endTime:'11:00',capacity:20,registered:18}),
    E({id:'e4',title:'Một chiều thử men',status:'cancelled',startDate:'2026-09-28',endDate:'2026-09-28',startTime:'14:00',endTime:'16:00',capacity:12,registered:0,cancelReason:'Xưởng bảo trì khu vực lò nung.'})
  ];

  const collections = [
    {id:'c1',name:'Những bàn tay giữ nghề',desc:'Từ đất lụa, khám phá những người tiếp nối nghề bằng việc làm hằng ngày. Một tuyển chọn về kỹ năng, ký ức và những cách sáng tạo mới.',topic:'craft',cover:'clay',storyIds:['s1','s4','s5','s11','s12','s2'],status:'published',version:1,editorId:'u2',updatedAt:'2026-10-02T09:00:00',draft:null},
    {id:'c2',name:'Một vòng di sản Huế',desc:'Những câu chuyện từ nhà vườn và mái ngói rêu của Huế.',topic:'heritage',cover:'heritage',storyIds:['s3','s13'],status:'published',version:1,editorId:'u2',updatedAt:'2026-10-02T09:30:00',draft:null},
    {id:'c3',name:'Ánh sáng phố Hội',desc:'',topic:'festival',cover:'',storyIds:['s2','s15'],status:'draft',version:0,editorId:'u2',updatedAt:day(1),draft:null},
    {id:'c4',name:'Những nếp nhà cũ',desc:'Những ngôi nhà cổ và người giữ nhà.',topic:'heritage',cover:'heritage',storyIds:['s3','s13','s14'],status:'archived',version:1,editorId:'u2',updatedAt:'2026-09-26T09:00:00',archivedAt:'2026-09-26',draft:null}
  ];

  const stop = (placeId,start,end) => ({id:'st'+Math.random().toString(36).slice(2,8),placeId,start,end});
  const trails = [
    {id:'t1',userId:'u1',name:'Một sáng ở Bát Tràng',date:'2026-10-10',city:'Hà Nội',status:'active',notes:'Liên hệ xưởng Thu Hà trước. Mang sổ nhỏ để ghi lại câu chuyện.',updatedAt:'2026-10-03T09:00:00',stops:[stop('p-cong-lang','09:00','09:30'),stop('p-xuong-thu-ha','09:45','11:15'),stop('p-trung-bay','11:30','12:00')]},
    {id:'t2',userId:'u1',name:'Một ngày chậm ở Hội An',date:'2026-11-02',city:'Quảng Nam',status:'active',notes:'',updatedAt:'2026-09-28T09:00:00',stops:[stop('p-hoian-den','09:00','10:00'),stop('p-hoian-tre','10:15','11:15'),stop('p-hoian-pho','18:00','18:45'),stop('p-hoi-an','19:00','20:00')]},
    {id:'t3',userId:'u1',name:'Đi qua những hiên Huế',date:'2026-11-20',city:'Huế',status:'active',notes:'',updatedAt:'2026-09-25T09:00:00',stops:[stop('p-hue-noi','08:30','09:30'),stop('p-hue-cho','09:45','10:30')]},
    {id:'t4',userId:'u1',name:'Chuyến đi cũ ở phố cổ',date:'2026-08-15',city:'Hà Nội',status:'archived',notes:'',updatedAt:'2026-08-16T09:00:00',stops:[stop('p-pho-co','09:00','11:00')]}
  ];

  const N = (id,userId,type,title,body,link,linkLabel,read,at) => ({id,userId,type,title,body,link,linkLabel,read,hidden:false,at});
  const notifications = [
    N('n1','u1','content','Câu chuyện “Màu men từ sân nhà” cần chỉnh sửa','Biên tập viên yêu cầu bổ sung nguồn ảnh và làm rõ đoạn mô tả kỹ thuật nung.','creator-story-editor.html?id=s7','Mở phản hồi',false,ago(5)),
    N('n2','u1','event','Ngày trải nghiệm gốm sẽ bắt đầu vào ngày mai','10/10/2026 · 09:00 · Xưởng gốm Thu Hà. Kiểm tra thông tin trước khi đến.','explorer-place-detail.html?id=p-bat-trang#events','Xem sự kiện',false,ago(35)),
    N('n3','u1','trail','Đã lưu “Một sáng ở Bát Tràng”','3 điểm dừng đã được lưu vào hành trình cá nhân. Bạn có thể tiếp tục chỉnh sửa.','explorer-my-trail.html?id=t1','Mở hành trình',false,ago(60)),
    N('n4','u1','content','“Bàn tay giữ hồn đất” đã được duyệt','Câu chuyện của bạn đã xuất bản và có thể được tìm thấy trong Khám phá.','explorer-story-detail.html?id=s1','Xem câu chuyện',true,day(1)),
    N('n5','u1','system','Quyền nhà sáng tạo đã được cấp','Chuyển vai trò từ menu tài khoản để quản lý hồ sơ, câu chuyện và sự kiện.','creator-profile.html','Đến không gian sáng tạo',true,day(2)),
    N('n6','u1','event','Sự kiện “Đất và những bàn tay” đã hoàn thành','Cảm ơn bạn đã tổ chức. Bản ghi được giữ trong lịch sử.','creator-event-management.html','Xem sự kiện',true,day(13)),
    N('n7','u1','trail','Gợi ý hành trình mới','Hội An có 3 điểm phù hợp với sở thích nghề thủ công của bạn.','explorer-ai-trail-generator.html','Tạo cùng AI',true,day(15)),
    N('n8','u1','content','“Sắc men từ những ngày mưa” đã được gửi','Bài của bạn đang chờ biên tập viên xem xét.','creator-story-management.html','Xem câu chuyện của tôi',true,day(20)),
    N('n9','u2','content','Có 3 nội dung đang chờ duyệt','Ưu tiên nội dung gửi sớm.','curator-content-review.html','Mở hàng đợi',false,ago(30)),
    N('n10','u5','system','Có 1 yêu cầu quyền mới','Chủ tài khoản Lê Ngọc Linh gửi yêu cầu kích hoạt lại.','admin-user-management.html','Xem người dùng',false,ago(90))
  ];

  const logs = [
    {id:'l1',at:'2026-10-03T09:00:00',text:'Nam cấp quyền sáng tạo cho Thu Hà.'},
    {id:'l2',at:'2026-10-01T09:00:00',text:'Nam tạm khóa tài khoản Linh theo yêu cầu chủ tài khoản.'}
  ];
  const taglogs = [{id:'tl1',at:'2026-09-30T10:00:00',text:'Nam tạo thẻ “Trải nghiệm” (chờ rà soát).'}];

  const analytics = {
    '2026-09':{weekly:[2180,2940,3120,4240],reads:12480,saves:1236,trails:428,published:86,newPub:18,deltas:[18.2,8.4,12.1],
      engage:[['Đọc hết bài',68],['Lưu câu chuyện',42],['Mở địa danh',56],['Lưu hành trình',29]],
      region:[['Miền Bắc',38],['Miền Trung',31],['Miền Nam',17]],
      topic:[['Nghề thủ công',34],['Di sản & kiến trúc',26],['Ẩm thực',17],['Lễ hội',9]],
      top:[['s1',2180,284],['s2',1920,216],['s3',1640,189]]},
    '2026-08':{weekly:[1700,2100,2480,2610],reads:8890,saves:1140,trails:382,published:68,newPub:14,deltas:[9.5,6.1,7.4],
      engage:[['Đọc hết bài',64],['Lưu câu chuyện',39],['Mở địa danh',51],['Lưu hành trình',26]],
      region:[['Miền Bắc',30],['Miền Trung',25],['Miền Nam',13]],
      topic:[['Nghề thủ công',27],['Di sản & kiến trúc',22],['Ẩm thực',13],['Lễ hội',6]],
      top:[['s1',1500,201],['s3',1210,160],['s2',1180,140]]}
  };

  CT.seed = {users,creators,places,tags,stories,events,collections,trails,notifications,logs,taglogs,analytics:[analytics]};
})();
