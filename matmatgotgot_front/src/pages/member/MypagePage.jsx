import styles from "./MypagePage.module.css";
import { useAuthStore } from '../../store/useAuthStore';
import {Link, useLocation, useParams} from "react-router-dom";
import defaultImg from "../../assets/img/defaultImg.svg";
import changeImg from "../../assets/img/changeImg.svg";
import nativeicon from "../../assets/img/native.svg";
import nativeIcon from "../../assets/img/nativeIcon.svg";
import navigate from "../../assets/img/navigate.svg";
import google from "../../assets/logo/google.svg";
import kakao from "../../assets/logo/kakao.svg";
import naver from "../../assets/logo/naver_green.svg";
import check from "../../assets/img/check.svg";
import checked from "../../assets/img/checked.svg";
import heart from "../../assets/img/heart.svg";
import view from "../../assets/img/view.svg";
import star from "../../assets/img/start.svg";
import starFill from "../../assets/img/starFILL.svg";
import search from "../../assets/img/search.svg";
import menu from "../../assets/img/menu.svg";
import blackStar from "../../assets/img/blackStar.svg";
import Rectangle from "../../assets/img/Rectangle.svg";
import calendar from "../../assets/img/calendar.svg";
import spot from "../../assets/img/spot.svg";
import people from "../../assets/img/people.svg";
import calendar2 from "../../assets/img/calendar2.svg";
import comment from "../../assets/img/comment.svg";
import axios from "axios";
import {useEffect, useRef, useState} from "react";
import Pagination from "../../components/ui/Pagination.jsx";
import {Input} from "../../components/ui/Form.jsx";
import BoardList from "../../components/member/BoardList.jsx";
import Swal from "sweetalert2";
import BoardLikeList from "../../components/member/BoardLikeList.jsx";
import BoardReports from "../../components/member/BoardReports.jsx";
import {useKakaoPostcode} from "@clroot/react-kakao-postcode";

export const MypagePage = () => {
   const location = useLocation();
   const path = location.pathname.substring(8);
    const { memberId, token } = useAuthStore();
    const [memberInfo, setMemberInfo] = useState(null);
    useEffect(() => {
        // 💡 가드 조건 강화: memberId와 token이 '둘 다 확실히 존재할 때만' 요청을 보냅니다.
        if (memberId && memberId !== "null" && token) {

            console.log("🚀 인증 토큰과 함께 회원정보 요청 중...", token);

            axios.get(`${import.meta.env.VITE_BACKSERVER}/members/${memberId}`, {
                // 💡 중요: 헤더에 Bearer 토큰을 직접 수동으로 꽂아줍니다.
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then((res) => {
                    console.log("✅ 회원정보 로드 성공:", res.data);
                    setMemberInfo(res.data);
                })
                .catch((err) => {
                    console.error("🚨 회원정보 로드 실패:", err);
                });

        } else {
            console.log("⏳ 아직 memberId나 token이 준비되지 않아 요청을 대기합니다.");
        }
    }, [memberId, token]);
   console.log(path);

  return (
    <div className="mypage">
        <div className={styles.mypage_wrap}>
            <div className={styles.sidebar_wrap}>
                <div>
                    <div className={styles.mypagetxt}>
                        마이페이지
                    </div>
                    <ul className={styles.menubar_wrap}>
                        <Link to="/mypage/myinfo">
                            <li className={path === "myinfo" ? styles.sidebar_active : styles.sidebar_default}>
                            내 정보
                            </li>
                        </Link>
                        <Link to="/mypage/myreview">
                            <li className={path === "myreview" ? styles.sidebar_active : styles.sidebar_default}>
                            내 리뷰
                            </li>
                        </Link>
                        <Link to="/mypage/zzim">
                            <li className={path === "zzim" ? styles.sidebar_active : styles.sidebar_default}>
                            찜한 맛집 목록
                            </li>
                        </Link>
                        <Link to="/mypage/matzip">
                            <li className={path === "matzip" ? styles.sidebar_active : styles.sidebar_default}>
                           내 코스 목록
                            </li>
                        </Link>
                        <Link to="/mypage/likeposts">
                            <li className={path === "likeposts" ? styles.sidebar_active : styles.sidebar_default}>
                            좋아요 게시글
                            </li>
                        </Link>
                        <Link to="/mypage/myposts">
                            <li className={path === "myposts" ? styles.sidebar_active : styles.sidebar_default}>
                            내 게시글
                            </li>
                        </Link>
                        <Link to="/mypage/reportposts">
                            <li className={path === "reportposts" ? styles.sidebar_active : styles.sidebar_default}>
                            신고 게시글
                            </li>
                        </Link>
                        <Link to="/mypage/myask">
                            <li className={path === "myask" ? styles.sidebar_active : styles.sidebar_default}>
                            1:1 문의 내역
                            </li>
                        </Link>
                    </ul>
                </div>
            </div>
            <div className={styles.content_wrap}>
                {path === "myinfo" && <Myinfo memberInfo={memberInfo} setMemberInfo={setMemberInfo} />}
                {path === "myreview" && <Myreview memberInfo={memberInfo} />}
                {path === "zzim" && <Zzim memberInfo={memberInfo} />}
                {path === "matzip" && <Matzip memberInfo={memberInfo} />}
                {path === "likeposts" && <Likeposts memberInfo={memberInfo} />}
                {path === "myposts" && <Myposts memberInfo={memberInfo}/>}
                {path === "reportposts" && <Reportposts memberInfo={memberInfo} />}
                {path === "myask" && <Myask />}
                {path === "myinfo/changePw" && <ChangePw />}
                {path === "myinfo/changeEmail" && <ChangeEmail memberInfo={memberInfo} />}
            </div>
        </div>
    </div>
  );
};

export const Myinfo = ({ memberInfo, setMemberInfo }) => {
    const inputRef = useRef(null);
    const detailRef = useRef();
    const { memberId, memberThumb } = useAuthStore();
    const [updateMode, setUpdateMode] = useState(false);
    const profileImgSrc = (memberThumb && memberThumb !== defaultImg)
        ? `${import.meta.env.VITE_BACKSERVER}/upload/${memberThumb}`
        : defaultImg;
    const { open } = useKakaoPostcode({
        onComplete: (data) => {
            setMemberInfo((prev) => ({ ...prev, ["memberAddress"]: data.roadAddress }));
            detailRef.current.focus();
        },
    });
    const openPostcode = useKakaoPostcode({
        onComplete: (data) => {
            // 주소 선택이 완료되면 실행되는 블록
            setMemberInfo((prev) => ({ ...prev, memberAddress: data.roadAddress }));

            // 🌟 여기서 바로 비교 로직을 타는 것이 가장 안전합니다.
            // (setState는 비동기라 memberInfo.memberAddress를 바로 비교하면 이전 값이 찍힐 수 있으므로 data.roadAddress와 직접 비교합니다.)
            if (data.roadAddress === currentAddr) {
                setNative(true);
            }
        } // 👈 onComplete 끝
    }); // 👈 useKakaoPostcode 훅 설정 끝 (괄호 누락 해결!)
    const updateModeChange = () => {
        setUpdateMode((prev) => !prev);
    };
    const changeThumb = () => {
        const file = inputRef.current.files && inputRef.current.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        axios
            .patch(
                `${import.meta.env.VITE_BACKSERVER}/members/${memberId}/thumbnail`,
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            )
            .then((res) => {
                console.log(res);
                useAuthStore.getState().setThumb(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    };
    const [nativeMember,setNativeMember]=useState([]);
    useEffect(() => {
        // 🌟 [안전장치] memberId가 없거나 'undefined' 문자열이면 아예 요청을 안 보냄!
        if (!memberId || memberId === 'undefined') {
            console.warn("memberId가 준비되지 않아 요청을 보낼 수 없습니다.");
            return;
        }

        // 값이 존재할 때만 서버에 요청
        axios.get(`${import.meta.env.VITE_BACKSERVER}/members/natives`, {
                  params: {
                    memberId: memberId
                  }
                })
            .then(response => {
                // 성공 시 처리할 로직 (예: setMemberData)
                console.log("성공 데이터:", response.data);
            })
            .catch(error => {
                console.error("서버 에러:", error);
            });

    }, [memberId]);
    const [native,setNative]=useState(false);
    const nativeCheck = () => {
        // 카카오 우편번호 팝업창을 띄웁니다.
        openPostcode();
    };

    if (!memberInfo) {
        return <div style={{ padding: "50px", textAlign: "center" }}>회원 정보를 불러오는 중입니다...</div>;
    }

    return (<>
        <div className={styles.content_menu_wrap}>
            <div className={styles.info_profile}>
                <div className={styles.image_wrap}>
                    {/* 💡 [이미지 원형 영역] 이 div에만 overflow: hidden을 줍니다. */}
                    <div className={styles.profile_img_circle}>
                        <img src={profileImgSrc} className={styles.defaultImg} alt="프로필" />
                    </div>

                    {/* 💡 [카메라 버튼] 원형 영역 바깥(image_wrap 안)에 위치시킵니다. */}
                    {updateMode ? (
                        <>
                            <img
                                src={changeImg}
                                alt="변경"
                                className={styles.changeImg}
                                onClick={() => inputRef.current.click()}
                            />
                            <input
                                type="file"
                                ref={inputRef}
                                style={{ display: "none" }}
                                onChange={changeThumb}
                            />
                        </>
                    ) : null}
                </div>
                <div>
                    <div>
                        <div className={styles.info_nick}>{updateMode ? <Input type="text" name="memberNickname" id="memberNickname" value={memberInfo.memberNickname} onChange={(e)=>setMemberInfo((prev)=>({...prev, [e.target.name]:e.target.value}))} /> : `${memberInfo.memberNickname}`}</div>
                        <div><img src={nativeicon} alt="인증" /></div>
                    </div>
                    <ul className={styles.info_member}>
                        <li>
                            <img src={navigate} alt=""/>
                            <div className={styles.info_profile_addr}>{updateMode ? <> <Input ref={detailRef} type="text" name="memberAddress" id="memberAddress" value={memberInfo.memberAddress} onChange={(e)=>setMemberInfo((prev)=>({...prev, [e.target.name]:e.target.value}))} /> <button onClick={open}>변경</button> </> : `${memberInfo.memberAddress}`}</div>
                        </li>
                        <li>
                            <img src={nativeIcon} alt=""/>
                            {updateMode? <><div>현지인 인증됨</div> <button className={styles.native_submit} onClick={nativeCheck}>인증</button></> : <div>현지인 인증됨</div>}
                        </li>
                        <li>
                            2026.06.04 ~ 2026.12.04
                        </li>
                    </ul>
                </div>
                <div className={styles.profile_submit}>
                    <button type="submit" className={styles.submit} onClick={updateModeChange}>{updateMode?"프로필 수정 완료" : "프로필 수정"}</button>
                </div>
            </div>
            <div className={styles.info_2line}>
                <div>
                    <div className={styles.info_email}>
                        <div>
                            <p className={styles.info_title}>이메일</p>
                            <p>{memberInfo.memberEmail}</p>
                        </div>
                        <div>
                            <button type="submit" className={styles.submit} onClick={()=>window.location.href="/mypage/myinfo/changeEmail"}>이메일 변경</button>
                        </div>
                    </div>
                    <div className={styles.info_pwchange}>
                        <p className={styles.info_title}>비밀번호 변경</p>
                        <button type="submit" className={styles.submit} onClick={()=>window.location.href="/mypage/myinfo/changePw"}>비밀번호 변경</button>
                    </div>
                </div>
                <div className={styles.info_alarm}>
                    <p className={styles.info_title}>알림설정</p>
                    <div>
                        <ul>
                            <li>앱 푸시 알람 수신 동의</li>
                            <li>이메일 알림 수신 동의</li>
                            <li>마케팅 정보 수신 동의</li>
                        </ul>
                        <div>
                            <label htmlFor="appPush"><img src={checked} /></label>
                            <label htmlFor="emailAlarm"><img src={check} /></label>
                            <label htmlFor="emailAlarm"><img src={check} /></label>
                            <input type="checkbox" name="appPush" id="appPush" className={styles.inputHidden}/>
                            <input type="checkbox" name="emailAlarm" id="emailAlarm" className={styles.inputHidden}/>
                            <input type="checkbox" name="marketing" id="marketing" className={styles.inputHidden}/>
                        </div>
                    </div>
                    <div>
                        <button type="submit" className={styles.submit}>알림설정 수정</button>
                    </div>
                </div>
            </div>
            <div className={styles.info_3line}>
                <div className={styles.info_social}>
                    <p className={styles.info_title}>소셜 계정 연동</p>
                    <ul>
                        <li><img src={google} /><span>구글 계정 연동하기</span></li>
                        <li><img src={kakao} /><span>카카오 계정 연동하기</span></li>
                        <li><img src={naver} /><span>네이버 계정 연동하기</span></li>
                    </ul>
                </div>
                <div className={styles.info_delete}>
                    <p className={styles.info_title}>회원탈퇴</p>
                    <div>
                        <p>맛맛곳곳에 저장된 기록들이 전부 삭제되며 해당 계정으로 다시 로그인 할 수 없습니다.</p>
                        <p>동의하십니까?</p>
                    </div>
                    <div>
                        <button type="submit" className={styles.submit_d}>회원 탈퇴</button>
                    </div>
                </div>
            </div>
        </div>
    </>);
};

export const Myreview = ({memberInfo}) => {
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_myreview_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                    <ul>
                        <li>작성순</li>
                        <li>좋아요순</li>
                        <li>별점순</li>
                    </ul>
                </div>
            </div>
            <div className={styles.posts}>
                {/*더미데이터*/}
                <div className={styles.post}>
                <div>
                    <div>
                        <p>맛집상호명</p>
                        <p><img src={starFill} /><img src={starFill} /><img src={starFill} /><img src={star} /><img src={star} /></p>
                    </div>
                    <div>2026.05.08</div>
                </div>
                <div>리뷰 내용 중 일부 텍스트 한줄 출력</div>
                <div>
                    <div>
                        <p><img src={heart} /> 12</p>
                        <p><img src={view} /> 321</p>
                    </div>
                </div>
                </div>
                {/*더미데이터*/}
            </div>
            <div>
                <Pagination />
            </div>
        </div>
    </>);};

export const Zzim = ({memberInfo}) => {
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_zzim_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                    <p>별점순</p>
                    <div className={styles.posts_bar_search}>
                        <Input type="search"/>
                        <p><img src={search} alt=""/></p>
                    </div>
                </div>
            </div>
            <div className={styles.matzips}>
                {/*더미데이터*/}
                <div className={styles.matzip}>
                    <div>
                        <p>맛집상호명</p>
                        <div><img src={menu} alt="" /></div>
                    </div>
                    <div>
                        <img src={Rectangle} alt=""/>
                    </div>
                    <div>
                        <p>맛곳광역시 맛곳구 맛곳동</p>
                        <p>중식당</p>
                        <p>운영 전 9:00 오픈</p>
                    </div>
                    <div>
                        <p><img src={heart} alt=""/> 123</p>
                        <p><img src={blackStar} alt=""/></p>
                    </div>
                </div>
                {/*더미데이터*/}
            </div>
            <div>
                <Pagination/>
            </div>
        </div>
    </>);};

export const Matzip = ({memberInfo}) => {
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_tuar_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                    <img src={calendar2} alt=""/>
                    <div className={styles.posts_bar_search}>
                        <Input type="search"/>
                        <p><img src={search} alt=""/></p>
                    </div>
                </div>
            </div>
            <div className={styles.tuars}>
                {/*더미데이터*/}
                <div className={styles.tuar}>
                    <div>
                        <p>코스명1</p>
                        <div><img src={menu} alt="" /></div>
                    </div>
                    <div>
                        <img src={Rectangle} alt=""/>
                    </div>
                    <div>
                        <ul>
                            <li><img src={calendar} alt=""/><span>2026.05.08 ~ 2026.05.10</span></li>
                            <li><img src={spot} alt=""/><span>여행지역</span></li>
                            <li><img src={people} alt=""/><span>부모님</span></li>
                        </ul>
                    </div>
                    <div>
                        <p><img src={blackStar} alt=""/></p>
                    </div>
                </div>
                {/*더미데이터*/}
            </div>
            <div>
                <Pagination/>
            </div>
        </div>
    </>);};

export const Likeposts = ({memberInfo}) => {
    const { memberId, memberNo} = useAuthStore();
    const memberno = memberInfo?.memberNo || memberNo;
    const [order, setOrder] = useState(0);
    const [myboard, setMyboard] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPage, setTotalPage] = useState(5);
    const size = 10;
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKSERVER}/boards/${memberno}/mylike`,{
            params: {
                page,
                size,
                order
            },
        })
            .then((res)=>{
                console.log(res.data);
                setMyboard(res.data.items);
                setTotalPage(res.data.totalPage);
            })
            .catch((err)=>{
                console.log(err);
            });
    },[page, order]);
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_likepost_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                    <ul>
                        <li onClick={()=>setOrder(1)}>작성순</li>
                        <li onClick={()=>setOrder(2)}>좋아요순</li>
                        <li onClick={()=>setOrder(3)}>조회수순</li>
                    </ul>
                </div>
            </div>
            <div className={styles.likeposts}>
                <BoardLikeList myboard={myboard} />
            </div>
            <div>
                <Pagination
                    page={page}
                    setPage={setPage}
                    totalPage={totalPage}
                    naviSize={5}/>
            </div>
        </div>
    </>);};

export const Myposts = ({memberInfo}) => {
    const { memberId, memberNo} = useAuthStore();
    const memberno = memberInfo?.memberNo || memberNo;
    const [order, setOrder] = useState(0);
    const [myboard, setMyboard] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPage, setTotalPage] = useState(5);
    const size = 10;
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKSERVER}/boards/${memberno}/my`,{
            params: {
                page,
                size,
                order
            },
        })
            .then((res)=>{
                console.log(res.data);
                setMyboard(res.data.items);
                setTotalPage(res.data.totalPage);
            })
            .catch((err)=>{
                console.log(err);
            });
    },[page, order]);
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_mypost_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                    <ul>
                        <li onClick={()=>setOrder(1)}>작성순</li>
                        <li onClick={()=>setOrder(2)}>좋아요순</li>
                        <li onClick={()=>setOrder(3)}>조회수순</li>
                    </ul>
                </div>
            </div>
            <div className={styles.myposts}>
                <BoardList myboard={myboard} />
            </div>
            <div>
                <Pagination
                    page={page}
                    setPage={setPage}
                    totalPage={totalPage}
                    naviSize={5}/>
            </div>
        </div>
    </>);};

export const Reportposts = ({memberInfo}) => {
    const { memberId, memberNo } = useAuthStore();
    const memberno = memberInfo?.memberNo || memberNo;
    const [order, setOrder] = useState(0);
    const [myboard, setMyboard] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPage, setTotalPage] = useState(5);
    const size = 10;
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKSERVER}/boards/${memberno}/myreport`,{
            params: {
                page,
                size,
                order
            },
        })
            .then((res)=>{
                console.log(res.data);
                setMyboard(res.data.items);
                setTotalPage(res.data.totalPage);
            })
            .catch((err)=>{
                console.log(err);
            });
    },[page, order]);
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_likepost_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                </div>
            </div>
            <div className={styles.reports}>
                <BoardReports myboard={myboard} />
                {/*더미데이터*/}
                {/*<div className={styles.report}>*/}
                {/*    <div>1</div>*/}
                {/*    <div>게시글 제목</div>*/}
                {/*    <div>*/}
                {/*        <ul>*/}
                {/*            <li><img src={comment} alt=""/>2</li>*/}
                {/*            <li><img src={heart} alt=""/>12</li>*/}
                {/*            <li><img src={view} alt=""/>231</li>*/}
                {/*        </ul>*/}
                {/*    </div>*/}
                {/*    <div>2026.05.08</div>*/}
                {/*    <div className={styles.report_send}>신고접수</div>*/}
                {/*</div>*/}
                {/*더미데이터*/}
            </div>
            <div>
                <Pagination
                    page={page}
                    setPage={setPage}
                    totalPage={totalPage}
                    naviSize={5}/>
            </div>
        </div>
    </>);};

export const Myask = ({memberInfo}) => {
    return (<>
        <div className={`${styles.content_menu_wrap} ${styles.content_likepost_wrap}`}>
            <div className={styles.posts_bar}>
                <div>
                    <p>전체 선택</p>
                    <p>삭제</p>
                </div>
                <div>
                    <ul>
                        <li>작성순</li>
                        <li>처리순</li>
                    </ul>
                </div>
            </div>
            <div className={styles.asks}>
                {/*더미데이터*/}
                <div className={styles.ask}>
                    <div>1</div>
                    <div>게시글 제목</div>
                    <div>
                        <img src={comment} alt=""/>
                        <span>2</span>
                    </div>
                    <div>2026.05.08</div>
                    <div>문의접수</div>
                </div>
                {/*더미데이터*/}
            </div>
            <div>
                <Pagination/>
            </div>
        </div>
    </>);};
export const ChangePw = () => {
    const { memberId } = useAuthStore();
    const [checkPw, setCheckPw] = useState(0);
    const [checkPwRe, setCheckPwRe] = useState(0);
    const [pwMember, setPwMember] = useState({
        memberPw:"",
        newMemberPw:"",
        newMemberPwRe:"",
        memberId: memberId,
    });
    const inputPw = (e) => {
        setPwMember((prev)=>({
            ...prev, [e.target.name]: e.target.value
        }))
    };
    const pwChange = () => {
        console.log("서버로 전송할 데이터:", pwMember);
        axios.post(`${import.meta.env.VITE_BACKSERVER}/members/pwMember`, pwMember)
            .then((res)=>{console.log(res);
                Swal.mixin({
                    toast: true,
                    position: "top-end",
                    topLayer: true,
                    background: "#ffd95a",
                    color: "#2b1b17",
                    fontWeight: "600",
                    iconColor: "#fff",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                }).fire({
                    icon: "success",
                    title: "비밀번호 변경 성공",
                });
            })
            .catch((err)=> {
                console.log(err);
                Swal.mixin({
                    toast: true,
                    color: "#2b1b17",

                    borderRadius: "15px",
                    fontWeight: "800",
                    padding: "20px 10px",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                }).fire({
                    title: '비밀번호 변경 실패',
                    text: '현재 비밀번호가 맞는지 확인하세요.',
                    icon: 'error'
                });
                setPwMember({
                    memberPw:"",
                    newMemberPw:"",
                    newMemberPwRe:"",
                    memberId: memberId,
                })
            });
    };
    const pwReg = () => {
        const idReg = /^[a-zA-Z0-9]{8,50}$/;
        if(idReg.test(pwMember.newMemberPw)){
            setCheckPw(2);
        }else{
            setCheckPw(1);
        }
    };
    const pwDupCheck = () => {
        if (pwMember.newMemberPw === pwMember.newMemberPwRe) {
            return setCheckPwRe(1);
        } else {
            return setCheckPwRe(2);
        }
    };

    return (<>
        <div className={styles.content_changePw_wrap}>
            <div>비밀번호 변경</div>
            <div>
                <label htmlFor="memberPw">현재 비밀번호</label>
                <Input type="password" name="memberPw" id="memberPw" value={pwMember.memberPw} onChange={inputPw} />
            </div>
            <div>
                <div>
                    <label htmlFor="newMemberPw">새 비밀번호</label>
                    <Input type="password" name="newMemberPw" id="newMemberPw" value={pwMember.newMemberPw} onChange={inputPw} onBlur={pwReg} />
                </div>
                {checkPw > 0
                    ? checkPw === 1
                        ? <div className={styles.pwcheckf}>최소 8자 이상 영문과 숫자를 혼합하여주십시오.</div>
                        : null
                    : null
                }
                <div>
                    <label htmlFor="newMemberPwRe">새 비밀번호 확인</label>
                    <Input type="password" name="newMemberPwRe" id="newMemberPwRe" value={pwMember.newMemberPwRe} onChange={inputPw} onBlur={pwDupCheck} />
                </div>
                {checkPwRe > 0 && (
                    checkPwRe.length > 0 ?
                        checkPwRe === 1
                            ? <div className={styles.pwcheckt}>비밀번호가 일치합니다.</div>
                            : <div className={styles.pwcheckf}>비밀번호가 일치하지 않습니다.</div>
                        : checkPwRe === 2
                            ? <div className={styles.pwcheckf}>비밀번호가 일치하지 않습니다.</div>
                            : <div className={styles.pwcheckt}>비밀번호가 일치합니다.</div>
                )}
            </div>
            <button type="submit" className={`${styles.submit} ${styles.submit_chg}`} onClick={pwChange}>비밀번호 변경</button>
        </div>
    </>);
};

export const ChangeEmail = ({ memberInfo }) => {
    const { memberId } = useAuthStore();
    const [mailMember, setMailMember] = useState({
        memberId: memberInfo?.memberId || memberId,
        memberEmail: "",
        newMemberEmail: "",
        newMemberEmailRe: ""
    });
    const [mailAuth, setMailAuth] = useState(0);
    const [newMailAuth, setNewMailAuth] = useState(0);
    const [mailAuthCode, setMailAuthCode] = useState(null);
    const [mailAuthInput, setMailAuthInput] = useState("");
    const [time, setTime] = useState(180);
    const [timeout, setTimeout] = useState(null);
    const sendMail = () => {
        if(mailMember.memberEmail != memberInfo.memberEmail) {
            Swal.mixin({
                toast: true,
                color: "#2b1b17",
                borderRadius: "15px",
                fontWeight: "800",
                padding: "20px 10px",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            }).fire({
                title: '인증 메일전송 실패',
                text: '이메일을 입력해주세요.',
                icon: 'error'
            });
            return;
        }
        setTime(180);
        if (timeout) {
            window.clearInterval(timeout);
        }
        setMailAuth(1);
        axios
            .post(
                `${import.meta.env.VITE_BACKSERVER}/members/email-emailchange`,{
                    memberEmail: mailMember.memberEmail,
                })
                .then((res) => {
                    console.log(res);
                    setMailAuthCode(res.data.data);
                    setMailAuth(2);
                    setNewMailAuth(2);
                    const intervalId = window.setInterval(() => {
                        setTime((prev) => {
                            return prev - 1;
                        });
                    }, 1000);
                    setTimeout(intervalId);
                })
            .catch((err) => {
                console.error(err);
                Swal.mixin({
                    toast: true,
                    color: "#2b1b17",
                    borderRadius: "15px",
                    fontWeight: "800",
                    padding: "20px 10px",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                }).fire({
                    title: '인증 메일전송 실패',
                    text: '올바른 이메일을 입력해주세요.',
                    icon: 'error'
                });
                setMailAuth(0);
                setNewMailAuth(0);
            });
    };
    useEffect(() => {
        if (time === 0) {
            window.clearInterval(timeout);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setMailAuthCode(null);
            setTimeout(null);
        }
    }, [time])
    const showTime = () => {
        const min = Math.floor(time/60);
        const sec = String(time%60).padStart(2, "0");
        return `${min}:${sec}`;
    };
    const handleAuthCheck = () => {
        if (mailAuthCode === mailMember.newMemberEmail) {
            setMailAuth(3);
            setNewMailAuth(1); // 🌟 안전하게 이벤트 안에서 상태를 변경합니다!
            window.clearInterval(timeout);
            setTimeout(null);
        } else {
            Swal.mixin({
                toast: true,
                color: "#2b1b17",
                borderRadius: "15px",
                fontWeight: "800",
                padding: "20px 10px",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            }).fire({
                title: '인증 실패',
                text: '인증코드가 올바르지 않습니다.',
                icon: 'error'
            });
        }
    };
    const updateEmail = () => {
        axios.post(`${import.meta.env.VITE_BACKSERVER}/members/changeEmail`, mailMember)
            .then((res) => {
                console.log(res);
                if(res.data > 0) {
                    Swal.mixin({
                        toast: true,
                        position: "top-end",
                        topLayer: true,
                        background: "#ffd95a",
                        color: "#2b1b17",
                        fontWeight: "600",
                        iconColor: "#fff",
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.onmouseenter = Swal.stopTimer;
                            toast.onmouseleave = Swal.resumeTimer;
                        }
                    }).fire({
                        icon: "success",
                        title: "이메일 변경 성공",
                    });
                }
            })
            .catch((err) => {console.log(err);});
    };
    // 💡 두 번째 새로운 이메일 변경 및 성공 알림 처리
    const handleEmailChangeSubmit = () => {
        if (mailAuthCode === mailMember.newMemberEmailRe) {
            setNewMailAuth(3);
            window.clearInterval(timeout);
            setTimeout(null);
        } else {
            Swal.mixin({
                toast: true,
                color: "#2b1b17",
                borderRadius: "15px",
                fontWeight: "800",
                padding: "20px 10px",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            }).fire({
                title: '인증 실패',
                text: '인증코드가 올바르지 않습니다.',
                icon: 'error'
            });
        }
    };


    return (
        <>
            <div className={styles.content_changePw_wrap}>
                <div>이메일 변경</div>
                <div>
                    <label htmlFor="memberEmail">현재 이메일</label>
                    <Input type="email"
                           name="memberEmail"
                           id="memberEmail"
                           value={mailMember.memberEmail}
                           onChange={(e)=>setMailMember((prev)=>({
                               ...prev,
                               [e.target.name]: e.target.value
                           }))}
                           required
                           readOnly={mailAuth === 1 || mailAuth === 3}  />
                    <button
                        type="submit"
                        className={`${styles.submit} ${styles.submit_chgM}`}
                        onClick={sendMail}
                        disabled={mailAuth === 1 || mailAuth === 3}>
                        인증메일 보내기
                    </button>
                        {mailAuth > 1 && (
                            <div>
                            <div className={styles.inputLabel}>
                                <label htmlFor="newMemberEmail">이메일 확인</label>
                            </div>
                            <div>
                                <Input
                                    type="text"
                                    name="newMemberEmail"
                                    id="newMemberEmail"
                                    value={mailMember.newMemberEmail}
                                    onChange={(e)=>setMailMember((prev)=>({
                                        ...prev,
                                        [e.target.name]: e.target.value
                                    }))}
                                    disabled={mailAuth === 3}
                                />
                                <p className={styles.check_msg}>
                                    {mailAuth === 3 ? "인증되었습니다.": showTime()}
                                </p>
                                <button
                                    className={styles.submit_chgM}
                                    type="button"
                                    onClick={handleAuthCheck}
                                    disabled = {mailAuth === 3}
                                >
                                    인증하기
                                </button>
                            </div>
                        </div>
                    )}

                    {newMailAuth === 1 && (
                        <div>
                            <div className={styles.inputLabel}>
                                <label htmlFor="newMemberEmail">새로운 이메일 주소</label>
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    name="newMemberEmail"
                                    id="newMemberEmail"
                                    value={mailMember.newMemberEmailRe}
                                    onChange={(e)=>setMailMember((prev)=>({
                                        ...prev,
                                        [e.target.name]: e.target.value
                                    }))}
                                    disabled={newMailAuth === 3}
                                />
                                <p className={styles.check_msg}>
                                    {newMailAuth === 3 ? updateEmail(): showTime()}
                                </p>
                                <button
                                    className={styles.submit_chgM}
                                    type="button"
                                    onClick={handleEmailChangeSubmit}
                                    disabled = {newMailAuth === 3}
                                >
                                    이메일 변경하기
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default { MypagePage, Myinfo, Myreview, Zzim, Matzip, Likeposts, Myposts, Reportposts, Myask, ChangePw, ChangeEmail };
