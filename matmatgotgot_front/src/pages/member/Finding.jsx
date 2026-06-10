import styles from "./Finding.module.css";
import {useState} from "react";
import {Input} from "../../components/ui/Form.jsx";

const Finding = () => {
    const [idpwFind, setIdpwFind] = useState({
        memberId: "",
        memberName: "",
        memberEmail: "",
    });
    const inputFind = (e) => {
      const newidpwFind = {...idpwFind, [e.target.name]: e.target.value};
      setIdpwFind(newidpwFind);
    };
    const [click, setClick] = useState({
        left: true,
        right: false
    });
    const clicks = () => {
        setClick({
            left: click.right,
            right: click.left
        });
    };
    return (
        <div className={styles.wrap}>
            <div className={styles.finding_wrap}>
                <div className={styles.finding}>
                    <div onClick={clicks} className={click.left?`${styles.findingbase}`:`${styles.findingselect}`}>아이디 찾기</div>
                    <div onClick={clicks} className={click.right?`${styles.findingbase}`:`${styles.findingselect}`}>비밀번호 찾기</div>
                </div>
                <div>
                    {click.left && (
                    <div className={styles.id_wrap}>
                        <div>
                            <label htmlFor="memberName">이름</label>
                            <Input
                                type="text"
                                id="memberName"
                                name="memberName"
                                value={idpwFind.memberName}
                                onChange={inputFind}
                            />
                        </div>
                        <div>
                            <label htmlFor="memberEmail">이메일 주소</label>

                            <Input
                                type="email"
                                id="memberEmail"
                                name="memberEmail"
                                value={idpwFind.memberEmail}
                                onChange={inputFind}
                            />
                        </div>
                        <button type="submit" className={styles.submit}>아이디 찾기</button>
                    </div>
                    )}
                    {click.right && (
                    <div className={styles.pw_wrap}>
                        <div>
                            <label htmlFor="memberId">아이디</label>

                            <Input
                                type="text"
                                id="memberId"
                                name="memberId"
                                value={idpwFind.memberId}
                                onChange={inputFind}
                            />
                        </div>
                        <div>
                            <label htmlFor="memberEmail">이메일 주소</label>

                            <Input
                                type="text"
                                id="memberEmail"
                                name="memberEmail"
                                value={idpwFind.memberEmail}
                                onChange={inputFind}
                            />
                        </div>
                        <button type="submit" className={styles.submit}>비밀번호 찾기</button>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Finding;